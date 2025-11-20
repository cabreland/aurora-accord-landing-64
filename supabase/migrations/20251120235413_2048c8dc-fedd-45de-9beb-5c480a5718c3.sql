-- Fix security definer views by making them SECURITY INVOKER
-- This ensures views respect RLS policies of the querying user

-- Drop and recreate public_company_teasers with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_company_teasers;

CREATE VIEW public.public_company_teasers
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  industry,
  location,
  summary,
  revenue,
  ebitda,
  asking_price,
  stage,
  priority,
  fit_score,
  is_published,
  publish_at,
  teaser_payload,
  created_at,
  updated_at
FROM companies
WHERE (is_draft = false) 
  AND (is_published = true) 
  AND ((publish_at IS NULL) OR (publish_at <= now()));

-- Fix company_with_custom view
DROP VIEW IF EXISTS public.company_with_custom;

CREATE VIEW public.company_with_custom
WITH (security_invoker = true)
AS
SELECT 
  c.*,
  COALESCE(
    jsonb_object_agg(cf.key, cv.value) FILTER (WHERE cf.key IS NOT NULL),
    '{}'::jsonb
  ) as custom_fields
FROM companies c
LEFT JOIN company_custom_values cv ON c.id = cv.company_id
LEFT JOIN company_custom_fields cf ON cv.field_id = cf.id AND cf.is_active = true
WHERE c.is_draft = false
GROUP BY c.id;

-- Fix company_with_growth view
DROP VIEW IF EXISTS public.company_with_growth;

CREATE VIEW public.company_with_growth
WITH (security_invoker = true)
AS
SELECT 
  c.*,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', go.id,
        'title', go.title,
        'description', go.description,
        'tags', go.tags,
        'note', cgo.note
      )
    ) FILTER (WHERE go.id IS NOT NULL),
    '[]'::jsonb
  ) as growth_opportunities
FROM companies c
LEFT JOIN company_growth_opps cgo ON c.id = cgo.company_id
LEFT JOIN growth_opportunities go ON cgo.growth_id = go.id AND go.is_active = true
WHERE c.is_draft = false
GROUP BY c.id;

-- Fix investor_company_summary view if it exists
DROP VIEW IF EXISTS public.investor_company_summary;