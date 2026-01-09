-- 1. Add assignee_ids array column to diligence_requests
ALTER TABLE public.diligence_requests
ADD COLUMN assignee_ids UUID[] DEFAULT '{}';

-- 2. Migrate existing assignee_id data to assignee_ids array
UPDATE public.diligence_requests
SET assignee_ids = ARRAY[assignee_id]
WHERE assignee_id IS NOT NULL;

-- 3. Create table to track last viewed timestamp per user per request
CREATE TABLE public.diligence_request_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.diligence_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

-- 4. Add last_activity_at column if not exists (for tracking updates)
-- This column already exists, so we just ensure it's being used

-- 5. Enable RLS on diligence_request_views
ALTER TABLE public.diligence_request_views ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for diligence_request_views
CREATE POLICY "Users can view their own request views"
ON public.diligence_request_views
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own request views"
ON public.diligence_request_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own request views"
ON public.diligence_request_views
FOR UPDATE
USING (auth.uid() = user_id);

-- 7. Create index for efficient lookups
CREATE INDEX idx_diligence_request_views_user_request 
ON public.diligence_request_views(user_id, request_id);

CREATE INDEX idx_diligence_request_views_request 
ON public.diligence_request_views(request_id);

-- 8. Create function to mark request as viewed
CREATE OR REPLACE FUNCTION public.mark_diligence_request_viewed(p_request_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.diligence_request_views (request_id, user_id, last_viewed_at)
  VALUES (p_request_id, auth.uid(), NOW())
  ON CONFLICT (request_id, user_id)
  DO UPDATE SET last_viewed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Update notification function to handle multiple assignees
CREATE OR REPLACE FUNCTION public.create_diligence_notification(
  p_user_id UUID,
  p_request_id UUID,
  p_deal_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't create notification for the current user
  IF p_user_id = auth.uid() THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.diligence_notifications (user_id, request_id, deal_id, type, title, message)
  VALUES (p_user_id, p_request_id, p_deal_id, p_type, p_title, p_message)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Create function to notify all assignees
CREATE OR REPLACE FUNCTION public.notify_all_assignees(
  p_request_id UUID,
  p_deal_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_exclude_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_assignee_id UUID;
  v_assignee_ids UUID[];
BEGIN
  -- Get assignee_ids from the request
  SELECT assignee_ids INTO v_assignee_ids
  FROM public.diligence_requests
  WHERE id = p_request_id;
  
  -- Notify each assignee (except excluded user)
  IF v_assignee_ids IS NOT NULL THEN
    FOREACH v_assignee_id IN ARRAY v_assignee_ids
    LOOP
      IF v_assignee_id IS DISTINCT FROM p_exclude_user_id AND v_assignee_id IS DISTINCT FROM auth.uid() THEN
        PERFORM public.create_diligence_notification(
          v_assignee_id,
          p_request_id,
          p_deal_id,
          p_type,
          p_title,
          p_message
        );
      END IF;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;