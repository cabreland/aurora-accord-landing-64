-- Update some diligence requests to different stages for testing the stage filter
-- FitnessTech App -> Due Diligence stage
UPDATE diligence_requests 
SET stage = 'due_diligence' 
WHERE deal_id = 'a24edf11-35e2-460c-8b12-46fa100a41a4';

-- Also update one deal to final_review and set some risk scores for testing risk filter
UPDATE diligence_requests 
SET stage = 'final_review', risk_score = 75
WHERE deal_id = '8979ed55-11c0-442a-8ab7-f6f0fa46c084' 
AND id IN (
  SELECT id FROM diligence_requests 
  WHERE deal_id = '8979ed55-11c0-442a-8ab7-f6f0fa46c084' 
  LIMIT 3
);