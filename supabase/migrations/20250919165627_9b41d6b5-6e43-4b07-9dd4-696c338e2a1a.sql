-- First, let's check what policies exist on storage.objects
-- Drop any existing conflicting policies for deal-documents bucket
DROP POLICY IF EXISTS "Users can view documents for accessible deals" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents to accessible deals" ON storage.objects;
DROP POLICY IF EXISTS "Users can update documents they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents they have access to" ON storage.objects;

-- Create simplified RLS policies for the deal-documents bucket

-- Policy: Authenticated users can view all documents (you can restrict this later)
CREATE POLICY "Authenticated users can view deal documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'deal-documents' AND 
  auth.role() = 'authenticated'
);

-- Policy: Authenticated users can upload documents
CREATE POLICY "Authenticated users can upload deal documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'deal-documents' AND 
  auth.role() = 'authenticated'
);

-- Policy: Authenticated users can update documents
CREATE POLICY "Authenticated users can update deal documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'deal-documents' AND 
  auth.role() = 'authenticated'
);

-- Policy: Authenticated users can delete documents
CREATE POLICY "Authenticated users can delete deal documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'deal-documents' AND 
  auth.role() = 'authenticated'
);