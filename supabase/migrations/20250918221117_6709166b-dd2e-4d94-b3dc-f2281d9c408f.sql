-- Fix foreign key relationships for activity monitoring
-- Add foreign key constraints to connect user_activity_log and user_sessions to profiles

-- Add foreign key for user_activity_log to profiles
ALTER TABLE public.user_activity_log 
ADD CONSTRAINT fk_user_activity_log_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key for user_sessions to profiles  
ALTER TABLE public.user_sessions 
ADD CONSTRAINT fk_user_sessions_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;