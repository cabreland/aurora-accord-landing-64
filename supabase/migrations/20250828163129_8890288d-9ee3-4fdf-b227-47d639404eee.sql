-- Add missing priority column to deals and index for filtering
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium';

CREATE INDEX IF NOT EXISTS idx_deals_priority ON public.deals (priority);