-- Create diligence_notifications table
CREATE TABLE public.diligence_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.diligence_requests(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'comment', 'document', 'status_change', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_diligence_notifications_user_id ON public.diligence_notifications(user_id);
CREATE INDEX idx_diligence_notifications_unread ON public.diligence_notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_diligence_notifications_created_at ON public.diligence_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.diligence_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.diligence_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.diligence_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow authenticated users to insert notifications (for triggers/functions)
CREATE POLICY "Authenticated users can create notifications"
ON public.diligence_notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own notifications"
ON public.diligence_notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_diligence_notification(
  p_user_id UUID,
  p_request_id UUID,
  p_deal_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Don't notify the user who triggered the action
  IF p_user_id = auth.uid() THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.diligence_notifications (
    user_id,
    request_id,
    deal_id,
    type,
    title,
    message
  )
  VALUES (
    p_user_id,
    p_request_id,
    p_deal_id,
    p_type,
    p_title,
    p_message
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;