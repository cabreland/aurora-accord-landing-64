
-- Fix overly permissive RLS policies on audit/logging tables
-- These should only allow authenticated users to insert (via SECURITY DEFINER functions)

-- 1. security_audit_log - restrict to authenticated users
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 2. security_events - restrict to authenticated users  
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
CREATE POLICY "Authenticated users can insert security events" 
ON public.security_events 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 3. settings_history - restrict to authenticated users
DROP POLICY IF EXISTS "System can insert settings history" ON public.settings_history;
CREATE POLICY "Authenticated users can insert settings history" 
ON public.settings_history 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 4. user_activity_log - restrict to authenticated users
DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_log;
CREATE POLICY "Authenticated users can insert activity logs" 
ON public.user_activity_log 
FOR INSERT 
TO authenticated
WITH CHECK (true);
