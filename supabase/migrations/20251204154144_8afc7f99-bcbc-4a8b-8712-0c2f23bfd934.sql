-- Create investor_profiles table for detailed onboarding data
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company_name text NOT NULL,
  linkedin_url text,
  
  -- Investment criteria
  target_industries text[] NOT NULL DEFAULT '{}',
  min_investment text NOT NULL,
  max_investment text NOT NULL,
  revenue_range_preference text NOT NULL,
  ebitda_range_preference text NOT NULL,
  geographic_preference text NOT NULL,
  
  -- Deal preferences
  primary_goal text NOT NULL,
  must_haves text[] DEFAULT '{}',
  deal_breakers text[] DEFAULT '{}',
  communication_preference text NOT NULL,
  
  -- Funding
  funding_type text NOT NULL,
  timeline_to_close text NOT NULL,
  pre_qualified text NOT NULL,
  referral_source text,
  referral_details text,
  
  -- Meta
  onboarding_completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own investor profile"
ON public.investor_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investor profile"
ON public.investor_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investor profile"
ON public.investor_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investor profiles"
ON public.investor_profiles
FOR SELECT
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- Create index for faster lookups
CREATE INDEX idx_investor_profiles_user_id ON public.investor_profiles(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_investor_profiles_updated_at
BEFORE UPDATE ON public.investor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();