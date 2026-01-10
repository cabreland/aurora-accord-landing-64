-- Fix check_deal_stage_triggers function to use valid enum values
-- The diligence_status enum only allows: open, in_progress, completed, blocked
-- Remove references to 'satisfied' and 'closed' which don't exist

CREATE OR REPLACE FUNCTION public.check_deal_stage_triggers(p_deal_id uuid)
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
  -- Only use 'completed' which is a valid diligence_status enum value
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'completed') as completed
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