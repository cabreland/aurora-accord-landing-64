-- Phase 2: Add publish controls to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS publish_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS teaser_payload jsonb DEFAULT '{}'::jsonb;

-- Create public_company_teasers view for investor access (views inherit RLS from base table)
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
WHERE is_draft = false 
  AND is_published = true 
  AND (publish_at IS NULL OR publish_at <= now());

-- Update RLS policies on companies table to handle publishing logic
DROP POLICY IF EXISTS "Authenticated can view finalized companies" ON public.companies;

-- New policy: Investors can only view published companies at the right time
CREATE POLICY "Investors can view published companies" 
ON public.companies 
FOR SELECT 
USING (
  is_draft = false 
  AND (
    -- Admin/staff can see all companies
    get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'editor'::user_role])
    OR (
      -- Investors can only see published companies at the right time
      get_user_role(auth.uid()) = 'viewer'::user_role
      AND is_published = true 
      AND (publish_at IS NULL OR publish_at <= now())
    )
  )
);

-- Create trigger for updated_at if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_companies_updated_at' 
    AND tgrelid = 'public.companies'::regclass
  ) THEN
    CREATE TRIGGER update_companies_updated_at 
      BEFORE UPDATE ON public.companies 
      FOR EACH ROW 
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;