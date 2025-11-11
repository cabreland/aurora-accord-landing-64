-- Add test data flag to deals table for safe test data management
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS is_test_data boolean DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_deals_test_data ON deals(is_test_data);

-- Add helpful comment
COMMENT ON COLUMN deals.is_test_data IS 'Marks deals created by seed function. Clear test data only deletes records where this is true.';