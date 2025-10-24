-- Allow users to delete their own conversations
CREATE POLICY "Investors can delete their own conversations"
ON conversations
FOR DELETE
TO authenticated
USING (investor_id = auth.uid());

-- Allow admins and brokers to delete any conversation
CREATE POLICY "Brokers and admins can delete all conversations"
ON conversations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'editor')
  )
);