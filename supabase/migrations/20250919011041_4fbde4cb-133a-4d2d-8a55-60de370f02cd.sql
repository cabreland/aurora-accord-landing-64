-- Fix RLS policy for investor_invitations to include super_admin role
-- The current policy only allows 'admin' role but user has 'super_admin' role

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage all invitations" ON investor_invitations;

-- Create updated policy that includes both admin and super_admin
CREATE POLICY "Admins can manage all invitations" 
ON investor_invitations 
FOR ALL 
TO authenticated
USING (get_user_role(auth.uid()) IN ('admin'::user_role, 'super_admin'::user_role));