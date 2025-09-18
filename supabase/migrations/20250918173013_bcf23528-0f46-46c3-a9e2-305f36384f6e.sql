-- Make deal_id nullable in investor_invitations table
ALTER TABLE public.investor_invitations 
ALTER COLUMN deal_id DROP NOT NULL;

-- Add constraint: deal_id required ONLY when access_type = 'single'
ALTER TABLE public.investor_invitations
ADD CONSTRAINT deal_id_required_for_single_access 
CHECK (
  (access_type = 'single' AND deal_id IS NOT NULL) OR
  (access_type != 'single')
);

-- Add constraint: portfolio_access must be true when access_type = 'portfolio'
ALTER TABLE public.investor_invitations
ADD CONSTRAINT portfolio_access_consistency
CHECK (
  (access_type = 'portfolio' AND portfolio_access = true) OR
  (access_type != 'portfolio')
);