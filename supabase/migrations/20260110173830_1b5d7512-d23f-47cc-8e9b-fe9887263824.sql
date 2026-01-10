-- Fix search_path for update_team_invitations_updated_at function
CREATE OR REPLACE FUNCTION public.update_team_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix search_path for expire_team_invitations function
CREATE OR REPLACE FUNCTION public.expire_team_invitations()
RETURNS void AS $$
BEGIN
  UPDATE public.team_invitations
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;