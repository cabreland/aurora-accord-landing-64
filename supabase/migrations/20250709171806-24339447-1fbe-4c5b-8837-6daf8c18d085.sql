-- Fix storage bucket policies for proper deal-level permissions
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;

-- Create more secure storage policies that check deal access
CREATE POLICY "Users can upload documents to assigned deals" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'deal-documents' 
  AND EXISTS (
    SELECT 1 FROM deal_assignments da 
    WHERE da.user_id = auth.uid() 
    AND da.can_upload = true 
    AND da.deal_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can view documents from assigned deals" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'deal-documents' 
  AND user_has_deal_access(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Users can update documents in assigned deals" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'deal-documents' 
  AND EXISTS (
    SELECT 1 FROM deal_assignments da 
    WHERE da.user_id = auth.uid() 
    AND da.can_upload = true 
    AND da.deal_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can delete documents in assigned deals" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'deal-documents' 
  AND EXISTS (
    SELECT 1 FROM deal_assignments da 
    WHERE da.user_id = auth.uid() 
    AND da.can_upload = true 
    AND da.deal_id::text = (storage.foldername(name))[1]
  )
);

-- Add audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent'
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;