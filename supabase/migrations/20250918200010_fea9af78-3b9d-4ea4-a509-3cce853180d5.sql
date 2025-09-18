-- Create table for storing e-signatures
CREATE TABLE public.nda_signatures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid,
  invitation_id uuid,
  signature_data jsonb NOT NULL, -- Contains signature info
  ip_address inet,
  user_agent text,
  signed_at timestamp with time zone NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own signatures" 
ON public.nda_signatures 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signatures" 
ON public.nda_signatures 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all signatures" 
ON public.nda_signatures 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create index for better performance
CREATE INDEX idx_nda_signatures_user_company ON public.nda_signatures(user_id, company_id);
CREATE INDEX idx_nda_signatures_invitation ON public.nda_signatures(invitation_id);