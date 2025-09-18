-- Enhanced Settings System Database Schema

-- User Activity Logging
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settings Change History
CREATE TABLE IF NOT EXISTS public.settings_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_reason TEXT
);

-- Active User Sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location_data JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Security Events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settings Categories (enhance existing settings table)
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS setting_type VARCHAR(20) DEFAULT 'string';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity_log(action);

CREATE INDEX IF NOT EXISTS idx_settings_history_key ON public.settings_history(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_history_changed_at ON public.settings_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);

CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);

-- Enable RLS on new tables
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Activity Log
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_log
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view their own activity" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON public.user_activity_log
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Settings History
CREATE POLICY "Admins can view settings history" ON public.settings_history
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert settings history" ON public.settings_history
  FOR INSERT WITH CHECK (true);

-- RLS Policies for User Sessions
CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON public.user_sessions
  FOR ALL USING (true);

-- RLS Policies for Security Events
CREATE POLICY "Admins can view security events" ON public.security_events
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT WITH CHECK (true);

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.user_activity_log (
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    user_agent,
    metadata
  )
  VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    p_metadata
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Function to log settings changes
CREATE OR REPLACE FUNCTION public.log_settings_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO public.settings_history (
      setting_key,
      old_value,
      new_value,
      changed_by
    )
    VALUES (
      NEW.key,
      OLD.value,
      NEW.value,
      auth.uid()
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.settings_history (
      setting_key,
      old_value,
      new_value,
      changed_by
    )
    VALUES (
      NEW.key,
      NULL,
      NEW.value,
      auth.uid()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for settings changes
DROP TRIGGER IF EXISTS settings_change_log_trigger ON public.settings;
CREATE TRIGGER settings_change_log_trigger
  AFTER INSERT OR UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_settings_change();

-- Function to record security events
CREATE OR REPLACE FUNCTION public.record_security_event(
  p_event_type VARCHAR(50),
  p_event_data JSONB DEFAULT '{}',
  p_severity VARCHAR(20) DEFAULT 'info'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    ip_address,
    user_agent,
    event_data,
    severity
  )
  VALUES (
    p_event_type,
    auth.uid(),
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    p_event_data,
    p_severity
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;