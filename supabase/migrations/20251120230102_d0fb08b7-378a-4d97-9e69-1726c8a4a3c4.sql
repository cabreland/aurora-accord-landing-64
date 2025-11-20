-- Add onboarding_skipped column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_skipped boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN profiles.onboarding_skipped IS 'Indicates if user skipped onboarding. If true and onboarding_completed is false, show banner prompt.';
