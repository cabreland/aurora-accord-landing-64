-- Fix RLS policy for document uploads to include super_admin role and fix deal assignment check
DROP POLICY IF EXISTS "Users with upload permission can insert documents" ON public.documents;

CREATE POLICY "Users with upload permission can insert documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  -- User has upload permission through deal assignment
  (EXISTS ( 
    SELECT 1
    FROM deal_assignments da
    WHERE da.deal_id = documents.deal_id 
    AND da.user_id = auth.uid() 
    AND da.can_upload = true
  )) 
  OR 
  -- User is admin or super_admin
  (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))
  OR 
  -- User created the deal
  (EXISTS ( 
    SELECT 1
    FROM deals d
    WHERE d.id = documents.deal_id 
    AND d.created_by = auth.uid()
  ))
);

-- Also update the SELECT policy to include super_admin
DROP POLICY IF EXISTS "Users can view documents for assigned deals" ON public.documents;

CREATE POLICY "Users can view documents for assigned deals" 
ON public.documents 
FOR SELECT 
USING (
  user_has_deal_access(auth.uid(), deal_id) 
  OR 
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
  OR
  (EXISTS ( 
    SELECT 1
    FROM deals d
    WHERE d.id = documents.deal_id 
    AND d.created_by = auth.uid()
  ))
);

-- Enable realtime for documents table
ALTER TABLE documents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;