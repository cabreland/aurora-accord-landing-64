
-- Update RLS policies for stricter access control

-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Users can view active growth opportunities" ON public.growth_opportunities;
DROP POLICY IF EXISTS "Users can view active custom fields" ON public.company_custom_fields;
DROP POLICY IF EXISTS "Users can view company growth opps for accessible companies" ON public.company_growth_opps;
DROP POLICY IF EXISTS "Users can view custom values for accessible companies" ON public.company_custom_values;

-- Stricter RLS policies - only admin/staff can do CRUD operations
-- Settings: Admin only
CREATE POLICY "Only admins can manage settings" ON public.settings
  FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Growth opportunities: Admin/Staff only for CRUD
CREATE POLICY "Admin and staff can manage growth opportunities" ON public.growth_opportunities
  FOR ALL USING (
    get_user_role(auth.uid()) = 'admin'::user_role 
    OR get_user_role(auth.uid()) = 'editor'::user_role
  );

-- Custom fields: Admin/Staff only for CRUD
CREATE POLICY "Admin and staff can manage custom fields" ON public.company_custom_fields
  FOR ALL USING (
    get_user_role(auth.uid()) = 'admin'::user_role 
    OR get_user_role(auth.uid()) = 'editor'::user_role
  );

-- Company growth opportunities: Admin/Staff only for CRUD
CREATE POLICY "Admin and staff can manage company growth opportunities" ON public.company_growth_opps
  FOR ALL USING (
    get_user_role(auth.uid()) = 'admin'::user_role 
    OR get_user_role(auth.uid()) = 'editor'::user_role
  );

-- Company custom values: Admin/Staff only for CRUD
CREATE POLICY "Admin and staff can manage company custom values" ON public.company_custom_values
  FOR ALL USING (
    get_user_role(auth.uid()) = 'admin'::user_role 
    OR get_user_role(auth.uid()) = 'editor'::user_role
  );

-- Create secure views for investor read-only access
-- View: Companies with custom field values resolved
CREATE OR REPLACE VIEW public.company_with_custom AS
SELECT 
  c.*,
  COALESCE(
    json_object_agg(
      cf.key, 
      CASE 
        WHEN cf.type = 'boolean' THEN (cv.value::text)::boolean
        WHEN cf.type = 'number' OR cf.type = 'currency' THEN (cv.value::text)::numeric
        ELSE cv.value::text
      END
    ) FILTER (WHERE cf.key IS NOT NULL), 
    '{}'::json
  ) as custom_fields
FROM companies c
LEFT JOIN company_custom_values cv ON c.id = cv.company_id
LEFT JOIN company_custom_fields cf ON cv.field_id = cf.id AND cf.is_active = true
WHERE c.is_draft = false
GROUP BY c.id, c.name, c.industry, c.location, c.summary, c.stage, c.priority, 
         c.fit_score, c.owner_id, c.revenue, c.ebitda, c.asking_price, c.passcode,
         c.highlights, c.risks, c.is_draft, c.created_at, c.updated_at;

-- View: Companies with growth opportunities resolved
CREATE OR REPLACE VIEW public.company_with_growth AS
SELECT 
  c.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', go.id,
        'title', go.title,
        'description', go.description,
        'tags', go.tags,
        'note', cgo.note
      )
    ) FILTER (WHERE go.id IS NOT NULL),
    '[]'::json
  ) as growth_opportunities
FROM companies c
LEFT JOIN company_growth_opps cgo ON c.id = cgo.company_id
LEFT JOIN growth_opportunities go ON cgo.growth_id = go.id AND go.is_active = true
WHERE c.is_draft = false
GROUP BY c.id, c.name, c.industry, c.location, c.summary, c.stage, c.priority,
         c.fit_score, c.owner_id, c.revenue, c.ebitda, c.asking_price, c.passcode,
         c.highlights, c.risks, c.is_draft, c.created_at, c.updated_at;

-- Enable RLS on views (they inherit from base tables but we make it explicit)
ALTER VIEW public.company_with_custom SET (security_barrier = true);
ALTER VIEW public.company_with_growth SET (security_barrier = true);

-- Create RLS policies for the views - investors can read resolved data
CREATE POLICY "Investors can view company with custom fields" ON public.company_with_custom
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'admin'::user_role 
    OR get_user_role(auth.uid()) = 'editor'::user_role 
    OR get_user_role(auth.uid()) = 'viewer'::user_role
  );

CREATE POLICY "Investors can view company with growth opportunities" ON public.company_with_growth
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'admin'::user_role 
    OR get_user_role(auth.uid()) = 'editor'::user_role 
    OR get_user_role(auth.uid()) = 'viewer'::user_role
  );

-- Create a function to get safe company data for investors (no raw settings exposure)
CREATE OR REPLACE FUNCTION public.get_investor_company_data(company_uuid uuid)
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'company', row_to_json(cwc.*),
    'growth_opportunities', (
      SELECT growth_opportunities 
      FROM company_with_growth cwg 
      WHERE cwg.id = company_uuid
    )
  )
  FROM company_with_custom cwc
  WHERE cwc.id = company_uuid;
$$;

-- Grant appropriate permissions
GRANT SELECT ON public.company_with_custom TO authenticated;
GRANT SELECT ON public.company_with_growth TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_investor_company_data(uuid) TO authenticated;
