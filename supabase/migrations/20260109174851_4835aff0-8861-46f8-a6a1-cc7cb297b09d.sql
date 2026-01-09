-- Add new columns to diligence_requests table
ALTER TABLE diligence_requests 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'early';

-- Add constraint for risk_score range
ALTER TABLE diligence_requests 
ADD CONSTRAINT risk_score_range CHECK (risk_score >= 0 AND risk_score <= 100);

-- Add constraint for valid stage values
ALTER TABLE diligence_requests 
ADD CONSTRAINT valid_stage CHECK (stage IN ('early', 'due_diligence', 'final_review', 'closed', 'on_hold'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_requests_stage ON diligence_requests(stage);
CREATE INDEX IF NOT EXISTS idx_requests_risk ON diligence_requests(risk_score);
CREATE INDEX IF NOT EXISTS idx_requests_activity ON diligence_requests(last_activity_at DESC);

-- Create trigger to update last_activity_at on any change
CREATE OR REPLACE FUNCTION update_diligence_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_diligence_activity ON diligence_requests;
CREATE TRIGGER trigger_diligence_activity
  BEFORE UPDATE ON diligence_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_diligence_last_activity();

-- Also update last_activity_at when comments are added
CREATE OR REPLACE FUNCTION update_request_activity_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE diligence_requests 
  SET last_activity_at = NOW() 
  WHERE id = NEW.request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comment_activity ON diligence_comments;
CREATE TRIGGER trigger_comment_activity
  AFTER INSERT ON diligence_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_request_activity_on_comment();