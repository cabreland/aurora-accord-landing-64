-- Fix RLS so super_admins can delete documents
ALTER POLICY "Admins can delete documents"
ON public.documents
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
);
