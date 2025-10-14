-- Phase 1: Critical Security Fixes
-- Step 1: Create user_roles table (using existing user_role enum)

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 2: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 3: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT user_id, role, created_at
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Step 5: Update existing RLS policies to use has_role() instead of get_user_role()
-- Note: We'll keep the role column in profiles for now for backward compatibility
-- The frontend will be updated to query user_roles table instead

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Log the migration
COMMENT ON TABLE public.user_roles IS 'Stores user role assignments separately from profiles for security. Prevents privilege escalation attacks.';