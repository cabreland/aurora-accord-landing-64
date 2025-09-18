-- Create enum for invitation status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- Create investor_invitations table
CREATE TABLE public.investor_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL,
  email TEXT NOT NULL,
  invitation_code TEXT UNIQUE NOT NULL,
  invited_by UUID NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  status invitation_status NOT NULL DEFAULT 'pending',
  investor_name TEXT,
  company_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.investor_invitations 
ADD CONSTRAINT fk_investor_invitations_deal 
FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;

ALTER TABLE public.investor_invitations 
ADD CONSTRAINT fk_investor_invitations_invited_by 
FOREIGN KEY (invited_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.investor_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies following existing patterns
CREATE POLICY "Admins can manage all invitations" 
ON public.investor_invitations 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Deal creators can manage their deal invitations" 
ON public.investor_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.deals d 
    WHERE d.id = deal_id AND d.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view invitations they created" 
ON public.investor_invitations 
FOR SELECT 
USING (invited_by = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_investor_invitations_updated_at
BEFORE UPDATE ON public.investor_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_investor_invitations_deal_id ON public.investor_invitations(deal_id);
CREATE INDEX idx_investor_invitations_email ON public.investor_invitations(email);
CREATE INDEX idx_investor_invitations_code ON public.investor_invitations(invitation_code);
CREATE INDEX idx_investor_invitations_status ON public.investor_invitations(status);