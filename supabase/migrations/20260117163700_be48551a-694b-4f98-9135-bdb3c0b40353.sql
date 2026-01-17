-- Create the data-room-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('data-room-documents', 'data-room-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for data-room-documents bucket
-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload data room documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'data-room-documents');

-- Policy: Authenticated users can read files
CREATE POLICY "Authenticated users can read data room documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'data-room-documents');

-- Policy: Authenticated users can delete their own uploads
CREATE POLICY "Authenticated users can delete data room documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'data-room-documents');

-- Policy: Authenticated users can update their files
CREATE POLICY "Authenticated users can update data room documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'data-room-documents');