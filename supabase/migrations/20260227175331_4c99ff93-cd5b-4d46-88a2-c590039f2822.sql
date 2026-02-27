-- Fix RLS recursion on deal_team_members and dependent activity queries

-- Helper function to check membership without triggering recursive policy evaluation
CREATE OR REPLACE FUNCTION public.is_deal_team_member(p_deal_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.deal_team_members dtm
    WHERE dtm.deal_id = p_deal_id
      AND dtm.user_id = p_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_deal_team_member(uuid, uuid) TO authenticated;

-- Replace recursive select policy on deal_team_members
DROP POLICY IF EXISTS "Team members can view deal team" ON public.deal_team_members;

CREATE POLICY "Team members can view deal team"
ON public.deal_team_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_deal_team_member(deal_id, auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.deal_assignments da
    WHERE da.deal_id = deal_team_members.deal_id
      AND da.user_id = auth.uid()
  )
  OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role])
);

-- Also remove direct dependency on deal_team_members policy in deal_activities SELECT policy
DROP POLICY IF EXISTS "Team members can view deal activities" ON public.deal_activities;

CREATE POLICY "Team members can view deal activities"
ON public.deal_activities
FOR SELECT
USING (
  public.is_deal_team_member(deal_id, auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.deal_assignments da
    WHERE da.deal_id = deal_activities.deal_id
      AND da.user_id = auth.uid()
  )
  OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role])
);