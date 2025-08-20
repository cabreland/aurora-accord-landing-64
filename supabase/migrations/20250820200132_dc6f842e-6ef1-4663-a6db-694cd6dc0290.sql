
-- Drop the incorrect functions first
DROP FUNCTION IF EXISTS public.accept_company_nda(uuid, text);
DROP FUNCTION IF EXISTS public.submit_access_request(uuid, confidential_level, text);
DROP FUNCTION IF EXISTS public.approve_access_request(uuid, confidential_level);
DROP FUNCTION IF EXISTS public.deny_access_request(uuid, text);
DROP VIEW IF EXISTS public.investor_company_summary;

-- 1. Helper function - level satisfies (no SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.level_satisfies(
  required_level access_level,
  user_level access_level
) RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN required_level = 'public' THEN true
    WHEN required_level = 'teaser' AND user_level IN ('teaser', 'cim', 'financials', 'full') THEN true
    WHEN required_level = 'cim' AND user_level IN ('cim', 'financials', 'full') THEN true
    WHEN required_level = 'financials' AND user_level IN ('financials', 'full') THEN true
    WHEN required_level = 'full' AND user_level = 'full' THEN true
    ELSE false
  END;
$$;

-- 2. Get user's access level for a company (no SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.user_company_access_level(
  p_user_id uuid,
  p_company_id uuid
) RETURNS access_level
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT access_level 
     FROM user_company_access 
     WHERE user_id = p_user_id AND company_id = p_company_id),
    'public'::access_level
  );
$$;

-- 3. Check if user can view company confidential content (no SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.can_view_company_confidential(
  p_user_id uuid,
  p_company_id uuid,
  p_required_level access_level
) RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.level_satisfies(
    p_required_level,
    public.user_company_access_level(p_user_id, p_company_id)
  );
$$;

-- 4. Accept/Update NDA (uses ndas table) - RPC with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.accept_company_nda(
  p_company_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_nda_record ndas%ROWTYPE;
  v_result json;
BEGIN
  -- Verify authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get the current NDA for this company
  SELECT * INTO v_nda_record
  FROM ndas
  WHERE company_id = p_company_id AND is_active = true
  ORDER BY version DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active NDA found for company';
  END IF;

  -- Upsert NDA acceptance
  INSERT INTO ndas (
    company_id,
    user_id,
    version,
    content,
    accepted_at,
    ip_address,
    is_active
  ) VALUES (
    p_company_id,
    v_user_id,
    v_nda_record.version,
    v_nda_record.content,
    now(),
    inet_client_addr(),
    true
  )
  ON CONFLICT (company_id, user_id) 
  DO UPDATE SET
    version = EXCLUDED.version,
    accepted_at = EXCLUDED.accepted_at,
    ip_address = EXCLUDED.ip_address,
    is_active = true;

  -- Log the activity
  PERFORM public.log_activity(
    'nda_accepted',
    json_build_object(
      'company_id', p_company_id,
      'nda_version', v_nda_record.version
    )
  );

  v_result := json_build_object(
    'success', true,
    'message', 'NDA accepted successfully',
    'company_id', p_company_id,
    'nda_version', v_nda_record.version
  );

  RETURN v_result;
END;
$$;

-- 5. Submit access request (uses access_requests table) - RPC with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.submit_access_request(
  p_company_id uuid,
  p_requested_level access_level,
  p_reason text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_request_id uuid;
  v_result json;
BEGIN
  -- Verify authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if user has accepted NDA for levels that require it
  IF p_requested_level IN ('cim', 'financials', 'full') THEN
    IF NOT EXISTS (
      SELECT 1 FROM ndas 
      WHERE user_id = v_user_id AND company_id = p_company_id AND is_active = true
    ) THEN
      RAISE EXCEPTION 'NDA acceptance required before requesting access';
    END IF;
  END IF;

  -- Insert access request
  INSERT INTO access_requests (
    user_id,
    company_id,
    requested_level,
    reason,
    status
  ) VALUES (
    v_user_id,
    p_company_id,
    p_requested_level,
    p_reason,
    'pending'
  )
  RETURNING id INTO v_request_id;

  -- Log the activity
  PERFORM public.log_activity(
    'access_requested',
    json_build_object(
      'company_id', p_company_id,
      'requested_level', p_requested_level,
      'request_id', v_request_id
    )
  );

  v_result := json_build_object(
    'success', true,
    'message', 'Access request submitted successfully',
    'request_id', v_request_id,
    'company_id', p_company_id,
    'requested_level', p_requested_level
  );

  RETURN v_result;
END;
$$;

-- 6. Approve access request (Admin/Editor only, writes to user_company_access) - RPC with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.approve_access_request(
  p_request_id uuid,
  p_approved_level access_level DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_role user_role;
  v_request_record access_requests%ROWTYPE;
  v_final_level access_level;
  v_result json;
BEGIN
  -- Verify authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check user permissions using profiles.role
  SELECT role INTO v_user_role
  FROM profiles
  WHERE user_id = v_user_id;

  IF v_user_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Get the request record
  SELECT * INTO v_request_record
  FROM access_requests
  WHERE id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;

  -- Determine final access level (use provided or requested)
  v_final_level := COALESCE(p_approved_level, v_request_record.requested_level);

  -- Update the request status
  UPDATE access_requests SET
    status = 'approved',
    approved_by = v_user_id,
    approved_at = now(),
    approved_level = v_final_level
  WHERE id = p_request_id;

  -- Write to user_company_access table
  INSERT INTO user_company_access (
    user_id,
    company_id,
    access_level
  ) VALUES (
    v_request_record.user_id,
    v_request_record.company_id,
    v_final_level
  )
  ON CONFLICT (user_id, company_id)
  DO UPDATE SET access_level = EXCLUDED.access_level;

  -- Log the activity
  PERFORM public.log_activity(
    'access_approved',
    json_build_object(
      'request_id', p_request_id,
      'company_id', v_request_record.company_id,
      'user_id', v_request_record.user_id,
      'approved_level', v_final_level,
      'approved_by', v_user_id
    )
  );

  v_result := json_build_object(
    'success', true,
    'message', 'Access request approved successfully',
    'request_id', p_request_id,
    'approved_level', v_final_level
  );

  RETURN v_result;
END;
$$;

-- 7. Deny access request (Admin/Editor only) - RPC with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.deny_access_request(
  p_request_id uuid,
  p_reason text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_role user_role;
  v_request_record access_requests%ROWTYPE;
  v_result json;
BEGIN
  -- Verify authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check user permissions using profiles.role
  SELECT role INTO v_user_role
  FROM profiles
  WHERE user_id = v_user_id;

  IF v_user_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Get the request record
  SELECT * INTO v_request_record
  FROM access_requests
  WHERE id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;

  -- Update request status to denied
  UPDATE access_requests SET
    status = 'denied',
    approved_by = v_user_id,
    approved_at = now(),
    denial_reason = p_reason
  WHERE id = p_request_id;

  -- Log the activity
  PERFORM public.log_activity(
    'access_denied',
    json_build_object(
      'request_id', p_request_id,
      'company_id', v_request_record.company_id,
      'user_id', v_request_record.user_id,
      'denied_by', v_user_id,
      'reason', p_reason
    )
  );

  v_result := json_build_object(
    'success', true,
    'message', 'Access request denied',
    'request_id', p_request_id,
    'reason', p_reason
  );

  RETURN v_result;
END;
$$;

-- 8. Simple activity logging helper (no SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_activity(
  p_event_type text,
  p_event_data jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_activity_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  INSERT INTO activity_log (
    user_id,
    event_type,
    event_data,
    ip_address
  ) VALUES (
    v_user_id,
    p_event_type,
    p_event_data,
    inet_client_addr()
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$;

-- 9. Trimmed investor company summary view using known columns
CREATE OR REPLACE VIEW public.investor_company_summary AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.industry,
  c.website,
  c.logo_url,
  c.status as company_status,
  uca.access_level,
  nda.accepted_at as nda_accepted_at,
  nda.version as nda_version,
  -- Compute effective access level
  COALESCE(uca.access_level, 'public'::access_level) as effective_access_level
FROM companies c
LEFT JOIN user_company_access uca ON (uca.company_id = c.id AND uca.user_id = auth.uid())
LEFT JOIN ndas nda ON (nda.company_id = c.id AND nda.user_id = auth.uid() AND nda.is_active = true)
WHERE c.status = 'active';

-- Grant RPC permissions
GRANT EXECUTE ON FUNCTION public.accept_company_nda TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_access_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_access_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.deny_access_request TO authenticated;

-- Grant view access
GRANT SELECT ON public.investor_company_summary TO authenticated;
