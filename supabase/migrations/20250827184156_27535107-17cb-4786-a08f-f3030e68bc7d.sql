-- Phase 3: NDA acceptance tracking
CREATE TABLE IF NOT EXISTS public.company_nda_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  nda_version text DEFAULT '1.0',
  UNIQUE(user_id, company_id)
);

-- Enable RLS
ALTER TABLE public.company_nda_acceptances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own NDA acceptances" 
ON public.company_nda_acceptances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own NDA acceptances" 
ON public.company_nda_acceptances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all NDA acceptances" 
ON public.company_nda_acceptances 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Function to accept company NDA
CREATE OR REPLACE FUNCTION public.accept_company_nda(p_company_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_acceptance_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Insert NDA acceptance (ON CONFLICT DO NOTHING handles duplicates)
  INSERT INTO public.company_nda_acceptances (user_id, company_id, ip_address, user_agent)
  VALUES (
    v_user_id, 
    p_company_id, 
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent'
  )
  ON CONFLICT (user_id, company_id) DO NOTHING
  RETURNING id INTO v_acceptance_id;

  -- Return success
  RETURN json_build_object(
    'success', true, 
    'acceptance_id', v_acceptance_id,
    'message', 'NDA accepted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to check if user has accepted NDA for a company
CREATE OR REPLACE FUNCTION public.user_has_accepted_nda(p_user_id uuid, p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_nda_acceptances 
    WHERE user_id = p_user_id AND company_id = p_company_id
  );
$$;