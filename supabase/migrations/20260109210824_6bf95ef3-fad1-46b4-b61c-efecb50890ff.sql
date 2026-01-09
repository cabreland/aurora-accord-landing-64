-- Add sent_to_customer tracking columns
ALTER TABLE public.diligence_comments
ADD COLUMN IF NOT EXISTS sent_to_customer boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sent_to_customer_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_from_customer boolean NOT NULL DEFAULT false;

-- Add index for customer-sent comments
CREATE INDEX IF NOT EXISTS idx_diligence_comments_sent ON public.diligence_comments(request_id, sent_to_customer) WHERE sent_to_customer = true;