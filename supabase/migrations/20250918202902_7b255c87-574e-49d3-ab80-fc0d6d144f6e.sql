-- Set cabreland@gmail.com as super admin
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'cabreland@gmail.com';