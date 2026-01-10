-- Create team invitation status enum
CREATE TYPE public.team_invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- Create team_invitations table for tracking invitations
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  personal_message TEXT,
  invitation_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status team_invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team_invitations
CREATE POLICY "Admins can view all invitations"
  ON public.team_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can view invitations they sent"
  ON public.team_invitations
  FOR SELECT
  TO authenticated
  USING (inviter_id = auth.uid());

CREATE POLICY "Admins can create invitations"
  ON public.team_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'editor')
    )
  );

CREATE POLICY "Admins can update invitations"
  ON public.team_invitations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete invitations"
  ON public.team_invitations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_team_invitations_token ON public.team_invitations(invitation_token);
CREATE INDEX idx_team_invitations_invitee_email ON public.team_invitations(invitee_email);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);
CREATE INDEX idx_team_invitations_inviter_id ON public.team_invitations(inviter_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_team_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_invitations_updated_at();

-- Create function to expire old invitations
CREATE OR REPLACE FUNCTION public.expire_team_invitations()
RETURNS void AS $$
BEGIN
  UPDATE public.team_invitations
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;