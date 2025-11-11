-- Ensure every deal has an associated company for NDA purposes
-- Create companies for deals that don't have one

-- First, create companies for deals that are missing company_id
INSERT INTO companies (id, name, owner_id, is_draft, is_published, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  d.company_name as name,
  d.created_by as owner_id,
  CASE WHEN d.status = 'draft' THEN true ELSE false END as is_draft,
  CASE WHEN d.status = 'active' THEN true ELSE false END as is_published,
  d.created_at,
  d.updated_at
FROM deals d
WHERE d.company_id IS NULL
ON CONFLICT DO NOTHING;

-- Update deals to link to their newly created companies
UPDATE deals d
SET company_id = c.id
FROM companies c
WHERE d.company_id IS NULL 
  AND d.company_name = c.name
  AND d.created_by = c.owner_id;

-- Add a trigger to automatically create a company when a deal is created without one
CREATE OR REPLACE FUNCTION create_company_for_deal()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- If deal doesn't have a company_id, create a company
  IF NEW.company_id IS NULL THEN
    INSERT INTO companies (name, owner_id, is_draft, is_published, industry, location, summary, revenue, ebitda, asking_price)
    VALUES (
      NEW.company_name,
      NEW.created_by,
      CASE WHEN NEW.status = 'draft' THEN true ELSE false END,
      CASE WHEN NEW.status = 'active' THEN true ELSE false END,
      NEW.industry,
      NEW.location,
      NEW.description,
      NEW.revenue,
      NEW.ebitda,
      NEW.asking_price
    )
    RETURNING id INTO new_company_id;
    
    -- Set the company_id on the deal
    NEW.company_id = new_company_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS ensure_deal_has_company ON deals;
CREATE TRIGGER ensure_deal_has_company
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION create_company_for_deal();