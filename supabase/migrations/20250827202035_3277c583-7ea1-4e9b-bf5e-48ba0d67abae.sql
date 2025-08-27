-- CRITICAL SECURITY FIXES FOR M&A BROKER PLATFORM
-- Phase 1: Database Security Hardening (Fixed Version)

-- 1. FIX CRITICAL: Secure all database functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER SET search_path = public
AS $function$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_deal_access(user_uuid uuid, deal_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.deal_assignments 
    WHERE user_id = user_uuid AND deal_id = deal_uuid
  ) OR public.get_user_role(user_uuid) = 'admin';
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'viewer'::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_event_data jsonb DEFAULT NULL::jsonb, p_user_id uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent'
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.accept_company_nda(p_company_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  v_user_id uuid;
  v_acceptance_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Insert NDA acceptance (ON CONFLICT DO NOTHING handles duplicates)
  INSERT INTO public.company_nda_acceptances (user_id, company_id, ip_address, user_agent)
  VALUES (
    v_user_id, 
    p_company_id, 
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent'
  )
  ON CONFLICT (user_id, company_id) DO NOTHING
  RETURNING id INTO v_acceptance_id;

  -- Log security event
  PERFORM public.log_security_event('nda_accepted', json_build_object('company_id', p_company_id)::jsonb, v_user_id);

  -- Return success
  RETURN json_build_object(
    'success', true, 
    'acceptance_id', v_acceptance_id,
    'message', 'NDA accepted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log security event for failed NDA acceptance
    PERFORM public.log_security_event('nda_acceptance_failed', json_build_object('company_id', p_company_id, 'error', SQLERRM)::jsonb, v_user_id);
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_accepted_nda(p_user_id uuid, p_company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.company_nda_acceptances 
    WHERE user_id = p_user_id AND company_id = p_company_id
  );
$function$;

-- 2. FIX MEDIUM: Secure business intelligence data
-- Remove overly permissive policies on company_custom_fields
DROP POLICY IF EXISTS "Users can view active custom fields" ON public.company_custom_fields;

-- Add secure policy requiring authentication for custom fields
CREATE POLICY "Authenticated users can view active custom fields" 
ON public.company_custom_fields 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Remove overly permissive policies on growth_opportunities  
DROP POLICY IF EXISTS "Users can view active growth opportunities" ON public.growth_opportunities;

-- Add secure policy requiring authentication for growth opportunities
CREATE POLICY "Authenticated users can view active growth opportunities" 
ON public.growth_opportunities 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- 3. ADD SECURITY: Enhanced role management audit logging
CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Log role changes for security audit
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    PERFORM public.log_security_event(
      'user_role_changed',
      json_build_object(
        'user_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      )::jsonb
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_role_changes ON public.profiles;
CREATE TRIGGER audit_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 4. CREATE SECURE FUNCTION: Get published company teasers with proper access control
CREATE OR REPLACE FUNCTION public.get_published_company_teasers(search_query text DEFAULT NULL)
 RETURNS TABLE(
   id uuid,
   name text,
   industry text,
   location text,
   summary text,
   revenue text,
   ebitda text,
   asking_price text,
   stage companies_stage,
   priority companies_priority,
   fit_score integer,
   is_published boolean,
   publish_at timestamp with time zone,
   teaser_payload jsonb,
   created_at timestamp with time zone,
   updated_at timestamp with time zone
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER SET search_path = public
AS $function$
  SELECT 
    c.id,
    c.name,
    c.industry,
    c.location,
    c.summary,
    c.revenue,
    c.ebitda,
    c.asking_price,
    c.stage,
    c.priority,
    c.fit_score,
    c.is_published,
    c.publish_at,
    c.teaser_payload,
    c.created_at,
    c.updated_at
  FROM public.companies c
  WHERE 
    c.is_draft = false 
    AND c.is_published = true 
    AND (c.publish_at IS NULL OR c.publish_at <= now())
    AND (
      public.get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'editor'::user_role])
      OR (
        public.get_user_role(auth.uid()) = 'viewer'::user_role
        AND c.is_published = true
      )
    )
    AND (
      search_query IS NULL 
      OR c.name ILIKE '%' || search_query || '%'
      OR c.industry ILIKE '%' || search_query || '%'
    )
  ORDER BY c.created_at DESC;
$function$;