-- Drop the existing foreign key constraint on deal_watchlist
ALTER TABLE deal_watchlist 
DROP CONSTRAINT IF EXISTS deal_watchlist_deal_id_fkey;

-- Add foreign key to companies table instead
-- The deal_id column name is kept for compatibility, but it now references companies
ALTER TABLE deal_watchlist 
ADD CONSTRAINT deal_watchlist_company_id_fkey 
FOREIGN KEY (deal_id) 
REFERENCES companies(id) 
ON DELETE CASCADE;

-- Add comment to clarify this references companies
COMMENT ON COLUMN deal_watchlist.deal_id IS 'References companies.id - investor watchlist tracks companies, not internal deal records';