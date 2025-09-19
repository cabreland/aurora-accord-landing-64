-- Fix RLS policy for profiles table to include super_admin role
-- The current "Admins can view all profiles" policy only allows 'admin' role
-- but user has 'super_admin' role

-- Drop existing admin policies and recreate with both admin and super_admin
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create updated policies that include both admin and super_admin
CREATE POLICY "Admins can delete profiles" 
ON profiles 
FOR DELETE 
TO authenticated
USING (get_user_role(auth.uid()) IN ('admin'::user_role, 'super_admin'::user_role));

CREATE POLICY "Admins can insert profiles" 
ON profiles 
FOR INSERT 
TO authenticated
WITH CHECK (get_user_role(auth.uid()) IN ('admin'::user_role, 'super_admin'::user_role));

CREATE POLICY "Admins can update any profile" 
ON profiles 
FOR UPDATE 
TO authenticated
USING (get_user_role(auth.uid()) IN ('admin'::user_role, 'super_admin'::user_role));

CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) IN ('admin'::user_role, 'super_admin'::user_role));