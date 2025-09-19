-- Create the deal-documents storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('deal-documents', 'deal-documents', false);

-- Create RLS policies for the deal-documents bucket

-- Policy: Users can view documents for deals they have access to
CREATE POLICY "Users can view documents for accessible deals" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'deal-documents' AND
  (
    -- Admins and super_admins can view all
    get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
    OR
    -- Users can view documents for deals they have access to
    EXISTS (
      SELECT 1 FROM deals d 
      WHERE d.id::text = (storage.foldername(name))[1]
      AND (
        d.created_by = auth.uid() 
        OR user_has_deal_access(auth.uid(), d.id)
      )
    )
  )
);

-- Policy: Users can upload documents to deals they have access to
CREATE POLICY "Users can upload documents to accessible deals" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'deal-documents' AND
  (
    -- Admins and super_admins can upload anywhere
    get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
    OR
    -- Users can upload to deals they created or have upload access to
    EXISTS (
      SELECT 1 FROM deals d 
      WHERE d.id::text = (storage.foldername(name))[1]
      AND (
        d.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM deal_assignments da 
          WHERE da.deal_id = d.id 
          AND da.user_id = auth.uid() 
          AND da.can_upload = true
        )
      )
    )
  )
);

-- Policy: Users can update documents they uploaded or have access to
CREATE POLICY "Users can update documents they have access to" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'deal-documents' AND
  (
    -- Admins and super_admins can update all
    get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
    OR
    -- Users can update documents for deals they have access to
    EXISTS (
      SELECT 1 FROM deals d 
      WHERE d.id::text = (storage.foldername(name))[1]
      AND (
        d.created_by = auth.uid() 
        OR user_has_deal_access(auth.uid(), d.id)
      )
    )
  )
);

-- Policy: Users can delete documents they have access to
CREATE POLICY "Users can delete documents they have access to" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'deal-documents' AND
  (
    -- Admins and super_admins can delete all
    get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
    OR
    -- Users can delete documents for deals they created
    EXISTS (
      SELECT 1 FROM deals d 
      WHERE d.id::text = (storage.foldername(name))[1]
      AND d.created_by = auth.uid()
    )
  )
);