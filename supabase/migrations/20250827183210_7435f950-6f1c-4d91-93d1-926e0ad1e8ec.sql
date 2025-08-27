-- Phase 2: Add publish controls to companies table
ALTER TABLE public.companies 
ADD COLUMN is_published boolean DEFAULT false NOT NULL,
ADD COLUMN publish_at timestamptz NULL,
ADD COLUMN teaser_payload jsonb DEFAULT '{}'::jsonb;

-- Backfill existing companies with is_published=false (already handled by DEFAULT)

-- Create public_company_teasers view for investor access
CREATE OR REPLACE VIEW public.public_company_teasers AS
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
FROM public.companies
WHERE is_draft = false;

-- Enable RLS on the view
ALTER TABLE public.public_company_teasers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Investors can only see published companies at the right time
CREATE POLICY "Investors can view published teasers" 
ON public.public_company_teasers 
FOR SELECT 
USING (
  is_published = true 
  AND (publish_at IS NULL OR publish_at <= now())
  AND (
    get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'editor'::user_role]) 
    OR get_user_role(auth.uid()) = 'viewer'::user_role
  )
);

-- RLS Policy: Admin/staff can see all teasers
CREATE POLICY "Admin and staff can view all teasers" 
ON public.public_company_teasers 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'editor'::user_role])
);

-- Update trigger for updated_at on companies table if not exists
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON public.companies 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();