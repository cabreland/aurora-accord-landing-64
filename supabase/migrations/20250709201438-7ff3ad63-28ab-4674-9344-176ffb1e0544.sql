-- Update the current user (Chris Breland) to admin role
UPDATE profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'cabreland@gmail.com';

-- Update the handle_new_user function to set default role as viewer for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'viewer'::user_role  -- Default new users to viewer (Investor) role
  );
  RETURN NEW;
END;
$$;