-- Add signature tracking columns to company_nda_acceptances
ALTER TABLE company_nda_acceptances
ADD COLUMN IF NOT EXISTS signature text,
ADD COLUMN IF NOT EXISTS signer_name text,
ADD COLUMN IF NOT EXISTS signer_email text,
ADD COLUMN IF NOT EXISTS signer_company text,
ADD COLUMN IF NOT EXISTS nda_content text,
ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '60 days'),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nda_expires_at ON company_nda_acceptances(expires_at);
CREATE INDEX IF NOT EXISTS idx_nda_status ON company_nda_acceptances(status);

-- Update existing records to have active status if null
UPDATE company_nda_acceptances SET status = 'active' WHERE status IS NULL;