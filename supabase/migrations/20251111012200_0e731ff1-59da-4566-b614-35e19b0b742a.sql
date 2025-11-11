-- Add UPDATE policy for admins to manage NDA status
CREATE POLICY "Admins can update NDA records"
ON company_nda_acceptances
FOR UPDATE
TO authenticated
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
)
WITH CHECK (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
);