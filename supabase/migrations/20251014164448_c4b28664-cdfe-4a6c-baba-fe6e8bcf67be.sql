-- Create company record for Blue Soft Websites (using correct types)
INSERT INTO public.companies (
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
  is_draft,
  is_published,
  publish_at,
  owner_id,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  d.company_name,
  d.industry,
  d.location,
  COALESCE(d.description, 'Digital agency with recurring revenue'),
  d.revenue,
  d.ebitda,
  d.asking_price,
  'discovery',
  'high',
  85,
  false,
  true, -- PUBLISHED
  now(),
  d.created_by,
  d.created_at,
  d.updated_at
FROM public.deals d
WHERE d.company_name ILIKE '%Blue Soft%'
AND d.status = 'active'
AND NOT EXISTS (
  SELECT 1 FROM public.companies c 
  WHERE c.name = d.company_name
)
RETURNING id, name, is_published;