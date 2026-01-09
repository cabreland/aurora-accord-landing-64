-- Create diligence_documents table for tracking uploaded files
CREATE TABLE public.diligence_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.diligence_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.diligence_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins and staff can manage diligence documents"
ON public.diligence_documents
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role]));

CREATE POLICY "Assignees can view documents on their requests"
ON public.diligence_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM diligence_requests dr
    WHERE dr.id = diligence_documents.request_id
    AND (
      auth.uid() = dr.assignee_id 
      OR auth.uid() = ANY(dr.reviewer_ids)
      OR EXISTS (
        SELECT 1 FROM deal_assignments da
        WHERE da.deal_id = dr.deal_id AND da.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Authenticated users can upload documents"
ON public.diligence_documents
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- Create storage bucket for diligence documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diligence-documents', 
  'diligence-documents', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg', 'text/plain', 'text/csv']
);

-- Storage policies for diligence-documents bucket
CREATE POLICY "Admins and staff can manage diligence files"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'diligence-documents'
  AND get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role])
);

CREATE POLICY "Users can upload diligence files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'diligence-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view diligence files they have access to"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'diligence-documents'
  AND (
    get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role])
    OR EXISTS (
      SELECT 1 FROM diligence_documents dd
      JOIN diligence_requests dr ON dr.id = dd.request_id
      WHERE dd.storage_path = name
      AND (
        auth.uid() = dr.assignee_id 
        OR auth.uid() = ANY(dr.reviewer_ids)
      )
    )
  )
);

-- Create index for faster lookups
CREATE INDEX idx_diligence_documents_request_id ON public.diligence_documents(request_id);