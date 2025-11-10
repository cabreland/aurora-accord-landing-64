-- Create user_company_access table
CREATE TABLE IF NOT EXISTS user_company_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  access_level text NOT NULL CHECK (access_level IN ('public', 'teaser', 'cim', 'financials', 'full')),
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now() NOT NULL,
  notes text,
  UNIQUE(user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_user_company_access_user ON user_company_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_access_company ON user_company_access(company_id);

-- RLS policies for user_company_access
ALTER TABLE user_company_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access" ON user_company_access
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all access" ON user_company_access
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
  );

-- Create access_requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  current_level text NOT NULL CHECK (current_level IN ('public', 'teaser', 'cim', 'financials', 'full')),
  requested_level text NOT NULL CHECK (requested_level IN ('public', 'teaser', 'cim', 'financials', 'full')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at timestamptz DEFAULT now() NOT NULL,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  review_notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_access_requests_user ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_company ON access_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);

-- RLS policies for access_requests
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own requests" ON access_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own requests" ON access_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all requests" ON access_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
  );

CREATE POLICY "Admins can update all requests" ON access_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
  );

-- Create document_views table
CREATE TABLE IF NOT EXISTS document_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('view', 'download')),
  viewed_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text,
  session_data jsonb
);

CREATE INDEX IF NOT EXISTS idx_document_views_document ON document_views(document_id);
CREATE INDEX IF NOT EXISTS idx_document_views_user ON document_views(user_id);
CREATE INDEX IF NOT EXISTS idx_document_views_action ON document_views(action);
CREATE INDEX IF NOT EXISTS idx_document_views_viewed_at ON document_views(viewed_at);

-- RLS policies for document_views
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log their own views" ON document_views
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all logs" ON document_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Add confidentiality_level to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS confidentiality_level text 
CHECK (confidentiality_level IN ('public', 'teaser', 'cim', 'financials', 'full'))
DEFAULT 'cim';

-- Map existing tags to confidentiality levels (using correct enum values)
UPDATE documents SET confidentiality_level = 
  CASE 
    WHEN tag = 'cim' THEN 'cim'
    WHEN tag = 'financials' THEN 'financials'
    WHEN tag = 'legal' THEN 'full'
    WHEN tag = 'due_diligence' THEN 'full'
    WHEN tag = 'nda' THEN 'public'
    WHEN tag = 'buyer_notes' THEN 'cim'
    WHEN tag = 'other' THEN 'cim'
    ELSE 'teaser'
  END
WHERE confidentiality_level = 'cim';

-- Create get_user_access_level function
CREATE OR REPLACE FUNCTION get_user_access_level(
  p_user_id uuid,
  p_company_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_access_level text;
  v_has_nda boolean;
  v_user_role user_role;
BEGIN
  -- Check if admin/editor (full access)
  SELECT role INTO v_user_role FROM profiles WHERE user_id = p_user_id;
  IF v_user_role IN ('admin', 'super_admin', 'editor') THEN
    RETURN 'full';
  END IF;

  -- Check explicit access grant
  SELECT access_level INTO v_access_level 
  FROM user_company_access 
  WHERE user_id = p_user_id AND company_id = p_company_id;
  
  IF v_access_level IS NOT NULL THEN
    RETURN v_access_level;
  END IF;

  -- Check NDA acceptance
  SELECT EXISTS(
    SELECT 1 FROM company_nda_acceptances 
    WHERE user_id = p_user_id AND company_id = p_company_id
  ) INTO v_has_nda;

  IF v_has_nda THEN
    RETURN 'teaser';
  END IF;

  -- Default public access
  RETURN 'public';
END;
$$;

-- Create can_access_document function
CREATE OR REPLACE FUNCTION can_access_document(
  p_user_id uuid,
  p_document_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doc_level text;
  v_company_id uuid;
  v_user_level text;
  v_access_hierarchy text[] := ARRAY['public', 'teaser', 'cim', 'financials', 'full'];
BEGIN
  -- Get document's confidentiality level and company
  SELECT d.confidentiality_level, dl.company_id
  INTO v_doc_level, v_company_id
  FROM documents d
  JOIN deals dl ON d.deal_id = dl.id
  WHERE d.id = p_document_id;

  IF v_company_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get user's access level
  v_user_level := get_user_access_level(p_user_id, v_company_id);

  -- Check hierarchy
  RETURN array_position(v_access_hierarchy, v_user_level) >= 
         array_position(v_access_hierarchy, v_doc_level);
END;
$$;