-- Add super_admin to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Set cabreland@gmail.com as super admin
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'cabreland@gmail.com';

-- If the user doesn't exist yet, we'll need to handle that case
-- This will create a profile if one doesn't exist for this email when they sign up