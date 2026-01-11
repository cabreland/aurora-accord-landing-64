-- Fix SECURITY DEFINER function and other functions without search_path
-- This prevents search_path hijacking attacks

-- 1. Fix update_platform_settings_timestamp (SECURITY DEFINER - critical)
CREATE OR REPLACE FUNCTION public.update_platform_settings_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$function$;

-- 2. Fix update_diligence_last_activity
CREATE OR REPLACE FUNCTION public.update_diligence_last_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. Fix update_request_activity_on_comment
CREATE OR REPLACE FUNCTION public.update_request_activity_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE diligence_requests 
  SET last_activity_at = NOW() 
  WHERE id = NEW.request_id;
  RETURN NEW;
END;
$function$;

-- 4. Fix update_settings_updated_at
CREATE OR REPLACE FUNCTION public.update_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 5. Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 6. Also fix update_diligence_comment_updated_at and update_team_invitations_updated_at
CREATE OR REPLACE FUNCTION public.update_diligence_comment_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_team_invitations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;