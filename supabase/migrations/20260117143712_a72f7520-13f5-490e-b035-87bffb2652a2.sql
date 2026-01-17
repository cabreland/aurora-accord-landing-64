
-- Explicitly drop the permissive session policy
DROP POLICY IF EXISTS "System can manage sessions" ON public.user_sessions;
