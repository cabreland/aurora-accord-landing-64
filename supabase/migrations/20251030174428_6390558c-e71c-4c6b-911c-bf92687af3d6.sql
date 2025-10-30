-- Update the status check constraint to include 'resolved'
ALTER TABLE conversations 
DROP CONSTRAINT IF EXISTS conversations_status_check;

ALTER TABLE conversations 
ADD CONSTRAINT conversations_status_check 
CHECK (status IN ('active', 'resolved', 'closed'));