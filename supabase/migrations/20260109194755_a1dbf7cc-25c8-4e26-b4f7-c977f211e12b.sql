-- Add updated_by column to track who last modified the request
ALTER TABLE diligence_requests
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Create function to auto-update updated_by and updated_at
CREATE OR REPLACE FUNCTION update_diligence_request_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS set_diligence_request_updated_by ON diligence_requests;

CREATE TRIGGER set_diligence_request_updated_by
BEFORE UPDATE ON diligence_requests
FOR EACH ROW
EXECUTE FUNCTION update_diligence_request_updated_by();