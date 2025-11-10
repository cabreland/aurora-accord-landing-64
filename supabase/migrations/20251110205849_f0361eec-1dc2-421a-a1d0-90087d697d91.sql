-- Ensure storage policies for deal-documents bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can download documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;

-- Allow authenticated admins and staff to upload
CREATE POLICY "Admins and staff can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deal-documents' AND
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE role IN ('admin', 'super_admin', 'editor')
  )
);

-- Allow authenticated users to download documents they have access to
CREATE POLICY "Authenticated users can download documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'deal-documents');

-- Allow admins and staff to delete documents
CREATE POLICY "Admins and staff can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'deal-documents' AND
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE role IN ('admin', 'super_admin', 'editor')
  )
);