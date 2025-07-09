-- Create enum types for onboarding responses
CREATE TYPE business_type AS ENUM ('saas', 'ecom', 'agency', 'other');
CREATE TYPE acquisition_goal AS ENUM ('buy_businesses', 'minority_partner', 'explore_options');
CREATE TYPE referral_source AS ENUM ('referral', 'social_media', 'search', 'other');

-- Create onboarding_responses table to store buyer information
CREATE TABLE public.onboarding_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Contact Information
  full_name TEXT,
  company_name TEXT,
  phone_number TEXT,
  linkedin_url TEXT,
  
  -- About Their Business
  owns_business BOOLEAN,
  business_type business_type,
  annual_revenue TEXT,
  annual_profit TEXT,
  
  -- Acquisition Goals
  acquisition_goal acquisition_goal,
  ideal_business_types business_type[],
  industries_of_interest TEXT[],
  
  -- Deal Criteria
  ttm_revenue_min BIGINT,
  ttm_revenue_max BIGINT,
  ttm_profit_min BIGINT,
  ttm_profit_max BIGINT,
  asking_price_min BIGINT,
  asking_price_max BIGINT,
  profit_multiple_min DECIMAL(4,2),
  profit_multiple_max DECIMAL(4,2),
  
  -- Tech Preferences
  preferred_tech_stacks TEXT[],
  
  -- Marketing
  referral_source referral_source,
  referral_other_details TEXT,
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own onboarding responses" 
ON public.onboarding_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding responses" 
ON public.onboarding_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding responses" 
ON public.onboarding_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding responses" 
ON public.onboarding_responses 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_onboarding_responses_updated_at
BEFORE UPDATE ON public.onboarding_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add onboarding_completed flag to profiles table
ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;