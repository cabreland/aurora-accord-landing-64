-- Fix the documents table RLS policy for INSERT
DROP POLICY IF EXISTS "Users with upload permission can insert documents" ON public.documents;

CREATE POLICY "Users with upload permission can insert documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  -- User has upload permission for this specific deal
  (EXISTS (
    SELECT 1 FROM public.deal_assignments da
    WHERE da.deal_id = deal_id 
    AND da.user_id = auth.uid() 
    AND da.can_upload = true
  ))
  OR
  -- Or user is admin
  (public.get_user_role(auth.uid()) = 'admin'::user_role)
  OR
  -- Or user created the deal
  (EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id = deal_id 
    AND d.created_by = auth.uid()
  ))
);

-- Ensure storage policies exist for deal-documents bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can view deal documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'deal-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can upload to deal-documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'deal-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can update their uploaded documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'deal-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can delete their uploaded documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'deal-documents' 
  AND auth.uid() IS NOT NULL
);