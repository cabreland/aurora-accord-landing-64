-- Add policy to allow team members to view profiles of other team members on their deals
-- This enables collaborative features (viewing teammate names, avatars, etc.)

CREATE POLICY "Team members can view deal team profiles" ON public.profiles
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM deal_team_members dtm
      WHERE dtm.user_id = profiles.user_id
      AND dtm.deal_id IN (
        SELECT deal_id FROM deal_team_members WHERE user_id = auth.uid()
      )
    )
  );