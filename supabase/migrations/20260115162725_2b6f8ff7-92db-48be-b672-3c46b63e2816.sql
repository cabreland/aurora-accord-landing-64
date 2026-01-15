-- Create partner_teams table for grouping partner organizations (e.g., Savvy Capital)
CREATE TABLE public.partner_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  primary_contact_email TEXT NOT NULL,
  team_type TEXT DEFAULT 'deal_partner' CHECK (team_type IN ('deal_partner', 'placement_agent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add partner_team_id to profiles table
ALTER TABLE public.profiles ADD COLUMN partner_team_id UUID REFERENCES public.partner_teams(id);

-- Create partner_deal_access table for granular per-deal permissions
CREATE TABLE public.partner_deal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  
  -- Partner's role on this deal
  partner_role TEXT NOT NULL CHECK (partner_role IN ('deal_originator', 'co_broker', 'technical_advisor')),
  
  -- Permissions (more than passive investor, less than internal staff)
  can_view_data_room BOOLEAN DEFAULT true,
  can_upload_documents BOOLEAN DEFAULT true,
  can_edit_deal_info BOOLEAN DEFAULT true,
  can_answer_dd_questions BOOLEAN DEFAULT true,
  can_view_buyer_activity BOOLEAN DEFAULT true,
  can_message_buyers BOOLEAN DEFAULT false,
  can_approve_data_room BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  
  -- Revenue share (if applicable)
  revenue_share_percent DECIMAL(5,2),
  
  -- Time restrictions
  access_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_until TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  granted_by UUID REFERENCES public.profiles(user_id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Unique constraint to prevent duplicate access entries
  UNIQUE(partner_id, deal_id)
);

-- Indexes for performance
CREATE INDEX idx_partner_deal_access_partner_id ON public.partner_deal_access(partner_id);
CREATE INDEX idx_partner_deal_access_deal_id ON public.partner_deal_access(deal_id);
CREATE INDEX idx_profiles_partner_team_id ON public.profiles(partner_team_id);

-- Enable RLS
ALTER TABLE public.partner_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_deal_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_teams
CREATE POLICY "Admins can manage partner teams"
ON public.partner_teams FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own partner team"
ON public.partner_teams FOR SELECT
USING (
  id IN (SELECT partner_team_id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for partner_deal_access
CREATE POLICY "Admins can manage partner deal access"
ON public.partner_deal_access FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Partners can view their own deal access"
ON public.partner_deal_access FOR SELECT
USING (partner_id = auth.uid());

-- Trigger for updated_at on partner_teams
CREATE TRIGGER update_partner_teams_updated_at
BEFORE UPDATE ON public.partner_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();