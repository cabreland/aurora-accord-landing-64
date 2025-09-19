-- Fix RLS policies for deals table to allow super_admin and admin roles
-- Update the INSERT policy to include super_admin role

-- First, drop the existing INSERT policy
DROP POLICY IF EXISTS "Editors and admins can create deals" ON public.deals;

-- Create new INSERT policy that includes super_admin
CREATE POLICY "Editors, admins and super_admins can create deals" 
ON public.deals
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'editor'::user_role, 'super_admin'::user_role]));

-- Also fix the SELECT policy to include super_admin
DROP POLICY IF EXISTS "Users can view assigned deals" ON public.deals;

CREATE POLICY "Users can view assigned deals or admins can view all" 
ON public.deals
FOR SELECT 
USING (
  user_has_deal_access(auth.uid(), id) 
  OR created_by = auth.uid() 
  OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
);

-- Update the UPDATE policy to include super_admin
DROP POLICY IF EXISTS "Creators and admins can update deals" ON public.deals;

CREATE POLICY "Creators, admins and super_admins can update deals" 
ON public.deals
FOR UPDATE 
USING (
  created_by = auth.uid() 
  OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
);

-- Update the DELETE policy to include super_admin
DROP POLICY IF EXISTS "Admins can delete deals" ON public.deals;

CREATE POLICY "Admins and super_admins can delete deals" 
ON public.deals
FOR DELETE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));