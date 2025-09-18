-- Fix search_path for security functions
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