-- 1) Fix incorrect documents INSERT policy and allow creators
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'documents' 
      AND policyname = 'Users with upload permission can insert documents'
  ) THEN
    DROP POLICY "Users with upload permission can insert documents" ON public.documents;
  END IF;
END $$;

CREATE POLICY "Users with upload permission can insert documents"
ON public.documents
FOR INSERT
WITH CHECK (
  -- User has upload permission for the deal targeted by NEW.deal_id
  EXISTS (
    SELECT 1 FROM public.deal_assignments da
    WHERE da.deal_id = deal_id
      AND da.user_id = auth.uid()
      AND da.can_upload = true
  )
  OR
  -- Or the user is an admin
  public.get_user_role(auth.uid()) = 'admin'::user_role
  OR
  -- Or the user is the deal creator
  EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id = deal_id AND d.created_by = auth.uid()
  )
);

-- 2) Add fine-grained Storage policies for the private 'deal-documents' bucket
-- We tie access to the first folder in the object path which must be the deal_id
-- Example path: <deal_id>/<category>/<timestamp>-<filename>

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Deal docs - select if has access'
  ) THEN
    CREATE POLICY "Deal docs - select if has access"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'deal-documents'
      AND public.user_has_deal_access(auth.uid(), (storage.foldername(name))[1]::uuid)
    );
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Deal docs - insert if can upload'
  ) THEN
    CREATE POLICY "Deal docs - insert if can upload"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'deal-documents'
      AND (
        public.get_user_role(auth.uid()) = 'admin'::user_role
        OR EXISTS (
          SELECT 1 FROM public.deal_assignments da
          WHERE da.user_id = auth.uid()
            AND da.deal_id = (storage.foldername(name))[1]::uuid
            AND da.can_upload = true
        )
        OR EXISTS (
          SELECT 1 FROM public.deals d
          WHERE d.created_by = auth.uid()
            AND d.id = (storage.foldername(name))[1]::uuid
        )
      )
    );
  END IF;
END $$;

-- UPDATE (allow if same as insert conditions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Deal docs - update if can upload'
  ) THEN
    CREATE POLICY "Deal docs - update if can upload"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'deal-documents'
      AND (
        public.get_user_role(auth.uid()) = 'admin'::user_role
        OR EXISTS (
          SELECT 1 FROM public.deal_assignments da
          WHERE da.user_id = auth.uid()
            AND da.deal_id = (storage.foldername(name))[1]::uuid
            AND da.can_upload = true
        )
        OR EXISTS (
          SELECT 1 FROM public.deals d
          WHERE d.created_by = auth.uid()
            AND d.id = (storage.foldername(name))[1]::uuid
        )
      )
    );
  END IF;
END $$;

-- DELETE (allow if admin or deal creator)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Deal docs - delete if admin or creator'
  ) THEN
    CREATE POLICY "Deal docs - delete if admin or creator"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'deal-documents'
      AND (
        public.get_user_role(auth.uid()) = 'admin'::user_role
        OR EXISTS (
          SELECT 1 FROM public.deals d
          WHERE d.created_by = auth.uid()
            AND d.id = (storage.foldername(name))[1]::uuid
        )
      )
    );
  END IF;
END $$;
