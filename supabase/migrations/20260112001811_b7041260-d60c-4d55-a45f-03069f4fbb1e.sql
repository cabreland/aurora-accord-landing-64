-- Add approval workflow fields to deals table
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft' CHECK (approval_status IN ('draft', 'needs_revision', 'under_review', 'approved', 'active', 'closed')),
ADD COLUMN IF NOT EXISTS submitted_for_review_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approval_notes text,
ADD COLUMN IF NOT EXISTS revision_requested_at timestamptz,
ADD COLUMN IF NOT EXISTS revision_notes text;

-- Add index for approval status queries
CREATE INDEX IF NOT EXISTS idx_deals_approval_status ON public.deals(approval_status);