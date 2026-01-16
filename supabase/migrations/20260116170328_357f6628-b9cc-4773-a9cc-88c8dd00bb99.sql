
-- Fix RLS policies to enforce user ownership instead of WITH CHECK (true)

-- 1. security_audit_log - user can only insert their own logs
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Users can insert their own audit logs" 
ON public.security_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 2. security_events - user can only insert their own events
DROP POLICY IF EXISTS "Authenticated users can insert security events" ON public.security_events;
CREATE POLICY "Users can insert their own security events" 
ON public.security_events 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 3. settings_history - user can only insert changes they made
DROP POLICY IF EXISTS "Authenticated users can insert settings history" ON public.settings_history;
CREATE POLICY "Users can insert their own settings history" 
ON public.settings_history 
FOR INSERT 
TO authenticated
WITH CHECK (changed_by = auth.uid() OR changed_by IS NULL);

-- 4. user_activity_log - user can only insert their own activity
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.user_activity_log;
CREATE POLICY "Users can insert their own activity logs" 
ON public.user_activity_log 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
