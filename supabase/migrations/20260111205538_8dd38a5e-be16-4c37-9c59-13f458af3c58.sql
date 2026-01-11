-- Fix infinite recursion between profiles and deal_team_members policies
-- The issue is:
--   profiles policy -> queries deal_team_members
--   deal_team_members policy -> queries profiles
-- This creates a circular reference

-- Step 1: Create a SECURITY DEFINER function to check if user is on a deal team
-- This bypasses RLS to prevent recursion
CREATE OR REPLACE FUNCTION public.is_on_same_deal_team(_user_id uuid, _target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM deal_team_members dtm1
    JOIN deal_team_members dtm2 ON dtm1.deal_id = dtm2.deal_id
    WHERE dtm1.user_id = _user_id 
    AND dtm2.user_id = _target_user_id
  )
$$;

-- Step 2: Drop the problematic policy on profiles
DROP POLICY IF EXISTS "Team members can view deal team profiles" ON public.profiles;

-- Step 3: Create a new policy using the SECURITY DEFINER function
CREATE POLICY "Team members can view deal team profiles" ON public.profiles
  FOR SELECT 
  USING (
    public.is_on_same_deal_team(auth.uid(), profiles.user_id)
  );

-- Step 4: Fix the deal_team_members policy that queries profiles
-- First drop the old one
DROP POLICY IF EXISTS "Admins can manage all team members" ON public.deal_team_members;

-- Step 5: Create new admin policy using the existing get_user_role function (which is SECURITY DEFINER)
CREATE POLICY "Admins can manage all team members" ON public.deal_team_members
  FOR ALL
  USING (
    public.get_user_role(auth.uid()) IN ('admin'::user_role, 'super_admin'::user_role, 'editor'::user_role)
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin'::user_role, 'super_admin'::user_role, 'editor'::user_role)
  );