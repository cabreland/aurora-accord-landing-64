
-- 1) Allow authenticated users to view finalized companies (keep drafts restricted)
-- Note: RLS is enabled and there are existing policies. We add a permissive policy
-- so that authenticated users can SELECT non-draft companies.
CREATE POLICY "Authenticated can view finalized companies"
ON public.companies
FOR SELECT
USING (
  is_draft = false
);

-- 2) Link deals to companies so "Edit Deal" can open the full Company Wizard
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS company_id uuid;

-- Add FK to companies; nullable so existing rows are valid; on delete, clear link.
ALTER TABLE public.deals
ADD CONSTRAINT deals_company_id_fkey
FOREIGN KEY (company_id)
REFERENCES public.companies (id)
ON DELETE SET NULL;

-- Optional but useful: index for lookups
CREATE INDEX IF NOT EXISTS deals_company_id_idx ON public.deals (company_id);
