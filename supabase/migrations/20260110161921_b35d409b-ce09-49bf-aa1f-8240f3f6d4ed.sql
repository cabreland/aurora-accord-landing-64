-- Add stage tracking columns to deals table
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS current_stage text DEFAULT 'deal_initiated',
ADD COLUMN IF NOT EXISTS deal_status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS stage_entered_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS deal_published_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS first_nda_signed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS loi_submitted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS loi_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS purchase_agreement_signed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone;

-- Create deal_stage_history table
CREATE TABLE IF NOT EXISTS public.deal_stage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  stage text NOT NULL,
  entered_at timestamp with time zone NOT NULL DEFAULT now(),
  exited_at timestamp with time zone,
  duration_days integer,
  triggered_by text DEFAULT 'manual',
  trigger_event text,
  user_id UUID,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_stage_history ENABLE ROW LEVEL SECURITY;

-- Create policies for deal_stage_history
CREATE POLICY "Users can view deal stage history" 
ON public.deal_stage_history 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert stage history" 
ON public.deal_stage_history 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update stage history" 
ON public.deal_stage_history 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON public.deal_stage_history(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_stage ON public.deal_stage_history(stage);

-- Create function to log stage changes
CREATE OR REPLACE FUNCTION public.log_deal_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if stage actually changed
  IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    -- Close out the old stage
    UPDATE public.deal_stage_history
    SET 
      exited_at = NOW(),
      duration_days = EXTRACT(DAY FROM (NOW() - entered_at))::integer
    WHERE deal_id = NEW.id 
    AND stage = OLD.current_stage 
    AND exited_at IS NULL;
    
    -- Insert new stage entry
    INSERT INTO public.deal_stage_history (
      deal_id,
      stage,
      entered_at,
      triggered_by,
      trigger_event,
      user_id
    )
    VALUES (
      NEW.id,
      NEW.current_stage,
      NOW(),
      COALESCE(NEW.stage_entered_at::text, 'auto'),
      NULL,
      auth.uid()
    );
    
    -- Update stage_entered_at
    NEW.stage_entered_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for stage changes
DROP TRIGGER IF EXISTS deal_stage_change_trigger ON public.deals;
CREATE TRIGGER deal_stage_change_trigger
  BEFORE UPDATE OF current_stage ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_deal_stage_change();

-- RPC to progress deal stage with proper logging
CREATE OR REPLACE FUNCTION public.progress_deal_stage(
  p_deal_id UUID,
  p_new_stage text,
  p_triggered_by text DEFAULT 'manual',
  p_trigger_event text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_stage text;
  v_result json;
BEGIN
  -- Get current stage
  SELECT current_stage INTO v_old_stage FROM deals WHERE id = p_deal_id;
  
  IF v_old_stage IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Deal not found');
  END IF;
  
  -- Close out old stage history
  UPDATE deal_stage_history
  SET 
    exited_at = NOW(),
    duration_days = EXTRACT(DAY FROM (NOW() - entered_at))::integer
  WHERE deal_id = p_deal_id 
  AND stage = v_old_stage 
  AND exited_at IS NULL;
  
  -- Insert new stage history
  INSERT INTO deal_stage_history (
    deal_id,
    stage,
    entered_at,
    triggered_by,
    trigger_event,
    user_id
  )
  VALUES (
    p_deal_id,
    p_new_stage,
    NOW(),
    p_triggered_by,
    p_trigger_event,
    auth.uid()
  );
  
  -- Update deal
  UPDATE deals
  SET 
    current_stage = p_new_stage,
    stage_entered_at = NOW(),
    updated_at = NOW()
  WHERE id = p_deal_id;
  
  -- Log activity
  INSERT INTO deal_activities (
    deal_id,
    user_id,
    activity_type,
    entity_type,
    metadata
  )
  VALUES (
    p_deal_id,
    auth.uid(),
    'status_changed',
    'deal',
    jsonb_build_object(
      'old_stage', v_old_stage,
      'new_stage', p_new_stage,
      'triggered_by', p_triggered_by,
      'trigger_event', p_trigger_event
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'old_stage', v_old_stage,
    'new_stage', p_new_stage
  );
END;
$$;

-- RPC to check stage progression triggers
CREATE OR REPLACE FUNCTION public.check_deal_stage_triggers(p_deal_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deal RECORD;
  v_request_stats RECORD;
  v_should_progress boolean := false;
  v_new_stage text;
  v_trigger_event text;
BEGIN
  -- Get deal info
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  
  IF v_deal IS NULL THEN
    RETURN json_build_object('should_progress', false, 'reason', 'Deal not found');
  END IF;
  
  -- Get request completion stats
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status IN ('completed', 'satisfied', 'closed')) as completed
  INTO v_request_stats
  FROM diligence_requests
  WHERE deal_id = p_deal_id;
  
  -- Check progression based on current stage
  CASE v_deal.current_stage
    WHEN 'deal_initiated' THEN
      -- Check if first NDA signed
      IF v_deal.first_nda_signed_at IS NOT NULL THEN
        v_should_progress := true;
        v_new_stage := 'information_request';
        v_trigger_event := 'first_nda_signed';
      END IF;
      
    WHEN 'information_request' THEN
      -- Check if LOI accepted
      IF v_deal.loi_accepted_at IS NOT NULL THEN
        v_should_progress := true;
        v_new_stage := 'analysis';
        v_trigger_event := 'loi_accepted';
      END IF;
      
    WHEN 'analysis' THEN
      -- Check if 90% request completion
      IF v_request_stats.total > 0 AND 
         (v_request_stats.completed::float / v_request_stats.total::float) >= 0.90 THEN
        v_should_progress := true;
        v_new_stage := 'final_review';
        v_trigger_event := 'request_completion_90';
      END IF;
      
    WHEN 'final_review' THEN
      -- Check if Purchase Agreement signed
      IF v_deal.purchase_agreement_signed_at IS NOT NULL THEN
        v_should_progress := true;
        v_new_stage := 'closing';
        v_trigger_event := 'purchase_agreement_signed';
      END IF;
      
    ELSE
      v_should_progress := false;
  END CASE;
  
  RETURN json_build_object(
    'should_progress', v_should_progress,
    'current_stage', v_deal.current_stage,
    'suggested_stage', v_new_stage,
    'trigger_event', v_trigger_event,
    'request_completion', CASE 
      WHEN v_request_stats.total > 0 
      THEN ROUND((v_request_stats.completed::float / v_request_stats.total::float) * 100)
      ELSE 0 
    END
  );
END;
$$;