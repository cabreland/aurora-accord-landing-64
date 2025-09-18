-- Create access type enum
CREATE TYPE access_type AS ENUM ('single', 'multiple', 'portfolio', 'custom');

-- Add new columns to investor_invitations table
ALTER TABLE public.investor_invitations 
ADD COLUMN access_type access_type NOT NULL DEFAULT 'single',
ADD COLUMN deal_ids JSONB,
ADD COLUMN portfolio_access BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN master_nda_signed BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies to handle multiple deal access
DROP POLICY "Deal creators can manage their deal invitations" ON public.investor_invitations;

CREATE POLICY "Deal creators can manage their deal invitations" 
ON public.investor_invitations
FOR ALL
USING (
  -- For single deal access - existing logic
  (access_type = 'single' AND EXISTS (
    SELECT 1 FROM deals d 
    WHERE d.id = investor_invitations.deal_id AND d.created_by = auth.uid()
  ))
  OR
  -- For multiple/custom deal access - check if user created any of the deals
  (access_type IN ('multiple', 'custom') AND EXISTS (
    SELECT 1 FROM deals d 
    WHERE d.id = ANY(SELECT jsonb_array_elements_text(deal_ids)::uuid) 
    AND d.created_by = auth.uid()
  ))
  OR
  -- For portfolio access - user must be admin or have created deals
  (access_type = 'portfolio' AND (
    get_user_role(auth.uid()) = 'admin' OR
    EXISTS (SELECT 1 FROM deals WHERE created_by = auth.uid())
  ))
);

-- Create function to check investor access to deals
CREATE OR REPLACE FUNCTION public.investor_has_deal_access(
  p_investor_email text,
  p_deal_id uuid
) RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM investor_invitations ii
    WHERE ii.email = p_investor_email
    AND ii.status = 'accepted'
    AND (
      -- Single deal access
      (ii.access_type = 'single' AND ii.deal_id = p_deal_id)
      OR
      -- Multiple/custom deal access
      (ii.access_type IN ('multiple', 'custom') AND ii.deal_ids ? p_deal_id::text)
      OR
      -- Portfolio access
      (ii.access_type = 'portfolio' AND ii.portfolio_access = true)
    )
  );
$$;