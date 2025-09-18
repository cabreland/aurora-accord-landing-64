-- Migrate registration_settings data to main settings table
INSERT INTO public.settings (key, value, category, description, setting_type, updated_at)
SELECT 
  setting_key as key,
  setting_value as value,
  'registration' as category,
  description,
  setting_type,
  updated_at
FROM public.registration_settings
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  setting_type = EXCLUDED.setting_type,
  updated_at = EXCLUDED.updated_at;

-- Add audit trail for the migration
SELECT public.log_security_event('settings_migration', 
  json_build_object('from_table', 'registration_settings', 'to_table', 'settings')::jsonb);