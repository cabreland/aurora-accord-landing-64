-- Create table for NDA extension tokens
CREATE TABLE IF NOT EXISTS nda_extension_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nda_id uuid NOT NULL REFERENCES company_nda_acceptances(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nda_extension_tokens_token ON nda_extension_tokens(token);
CREATE INDEX IF NOT EXISTS idx_nda_extension_tokens_nda_id ON nda_extension_tokens(nda_id);

-- Enable RLS
ALTER TABLE nda_extension_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow system/service role to manage tokens
CREATE POLICY "Service role can manage extension tokens"
ON nda_extension_tokens
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');