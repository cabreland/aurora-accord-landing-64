-- Add workflow_phase field to deals table with sell-side and buy-side stages
-- Workflow phases distinguish between sell-side preparation and buy-side active deal flow

-- Create enum type for workflow phases
CREATE TYPE workflow_phase AS ENUM (
  'listing_received',
  'under_review',
  'listing_approved',
  'data_room_build',
  'qa_compliance',
  'ready_for_distribution',
  'live_active',
  'under_loi',
  'due_diligence',
  'closing',
  'closed'
);

-- Add workflow_phase column to deals table
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS workflow_phase workflow_phase DEFAULT 'listing_received';

-- Add sell-side milestone timestamp columns
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS listing_received_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS listing_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS data_room_complete_at timestamp with time zone;

-- Create index for workflow phase queries
CREATE INDEX IF NOT EXISTS idx_deals_workflow_phase ON deals(workflow_phase);

-- Add comment for documentation
COMMENT ON COLUMN deals.workflow_phase IS 'Tracks the workflow phase - sell-side preparation (listing_received through ready_for_distribution) or buy-side active deal (live_active through closed)';