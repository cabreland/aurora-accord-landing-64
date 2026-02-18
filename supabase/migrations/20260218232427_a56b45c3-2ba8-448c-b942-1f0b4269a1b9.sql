
-- Batch 1A: Add business_type to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS business_type text;

-- Batch 6B: Add settings JSONB to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Batch 5A: Team groups tables
CREATE TABLE IF NOT EXISTS public.team_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.team_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member',
  permissions jsonb DEFAULT '{}'::jsonb,
  added_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.team_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view team groups"
  ON public.team_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage team groups"
  ON public.team_groups FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view team group members"
  ON public.team_group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage team group members"
  ON public.team_group_members FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Batch 6A: Deal share tokens
CREATE TABLE IF NOT EXISTS public.deal_share_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  access_level text DEFAULT 'teaser',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.deal_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage share tokens"
  ON public.deal_share_tokens FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Share tokens are readable by token value"
  ON public.deal_share_tokens FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
