-- Fix Critical Security Issue: User Data Exposure
-- Drop the overly permissive policy that allows all users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure policies for profile access
-- Admins can view all profiles (needed for user management interface)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Users can view their own profile only
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Fix the existing update policy to prevent role escalation
-- Drop existing update policy and create more secure one
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Users can update their own profile but NOT their role (prevents privilege escalation)
CREATE POLICY "Users can update own profile data" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND (OLD.role = NEW.role OR get_user_role(auth.uid()) = 'admin'::user_role));

-- Admins can update any profile including roles
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);