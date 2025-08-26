
-- Add new settings for the enhanced settings page
-- These will be stored as individual key-value pairs in the existing settings table

-- Insert default settings if they don't exist
INSERT INTO public.settings (key, value) VALUES
  -- Branding settings
  ('brand_name', '"Investor Portal"'::jsonb),
  ('brand_logo_url', '""'::jsonb),
  ('theme_primary', '"#5B8CFF"'::jsonb),
  
  -- Legal & NDA settings
  ('nda_template', '"# Non-Disclosure Agreement\n\nThis Non-Disclosure Agreement (\"Agreement\") is entered into on [DATE] by and between [COMPANY_NAME] and the undersigned party.\n\n## 1. Confidential Information\nAll information shared through this portal is considered confidential and proprietary.\n\n## 2. Obligations\nThe receiving party agrees to:\n- Keep all information strictly confidential\n- Not disclose to any third parties\n- Use information solely for evaluation purposes\n\n## 3. Term\nThis agreement remains in effect for 3 years from the date of execution.\n\nBy accepting, you agree to be bound by these terms."'::jsonb),
  ('require_nda', 'true'::jsonb),
  
  -- Access Policy settings
  ('allow_requests', 'true'::jsonb),
  ('default_confidential', '"nda_only"'::jsonb),
  ('auto_version', 'true'::jsonb),
  ('max_versions', '10'::jsonb),
  
  -- Notification settings
  ('email_from', '"noreply@company.com"'::jsonb),
  ('notify_new_access_request', 'true'::jsonb),
  ('notify_access_decided', 'true'::jsonb),
  ('notify_new_document', 'true'::jsonb),
  ('notify_nda_accepted', 'true'::jsonb),
  
  -- Data Retention settings
  ('signed_url_ttl_minutes', '15'::jsonb)
ON CONFLICT (key) DO NOTHING;
