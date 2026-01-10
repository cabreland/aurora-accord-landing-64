import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type DealStage = 
  | 'deal_initiated' 
  | 'information_request' 
  | 'analysis' 
  | 'final_review' 
  | 'closing';

export type DealStatus = 
  | 'draft' 
  | 'data_gathering' 
  | 'live' 
  | 'active' 
  | 'under_loi' 
  | 'closing' 
  | 'closed' 
  | 'dead';

export interface StageHistoryEntry {
  id: string;
  deal_id: string;
  stage: DealStage;
  entered_at: string;
  exited_at: string | null;
  duration_days: number | null;
  triggered_by: 'auto' | 'manual';
  trigger_event: string | null;
  user_id: string | null;
  created_at: string;
}

export interface StageProgressionCheck {
  should_progress: boolean;
  current_stage: DealStage;
  suggested_stage: DealStage | null;
  trigger_event: string | null;
  request_completion: number;
}

export interface DealStageInfo {
  current_stage: DealStage;
  deal_status: DealStatus;
  stage_entered_at: string | null;
  deal_published_at: string | null;
  first_nda_signed_at: string | null;
  loi_submitted_at: string | null;
  loi_accepted_at: string | null;
  purchase_agreement_signed_at: string | null;
  closed_at: string | null;
}

export const STAGE_ORDER: DealStage[] = [
  'deal_initiated',
  'information_request',
  'analysis',
  'final_review',
  'closing'
];

export const STAGE_LABELS: Record<DealStage, string> = {
  deal_initiated: 'Deal Initiated',
  information_request: 'Information Request',
  analysis: 'Analysis',
  final_review: 'Final Review',
  closing: 'Closing'
};

export const TRIGGER_LABELS: Record<string, string> = {
  first_nda_signed: 'First NDA signed by investor',
  loi_accepted: 'LOI accepted',
  request_completion_90: '90% request completion reached',
  purchase_agreement_signed: 'Purchase agreement signed',
  manual: 'Manual override by admin'
};

export const useDealStageManager = (dealId: string) => {
  const queryClient = useQueryClient();
  const [showProgressionAlert, setShowProgressionAlert] = useState(false);

  // Fetch deal stage info
  const { data: stageInfo, isLoading: isLoadingStageInfo } = useQuery({
    queryKey: ['deal-stage-info', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          current_stage,
          deal_status,
          stage_entered_at,
          deal_published_at,
          first_nda_signed_at,
          loi_submitted_at,
          loi_accepted_at,
          purchase_agreement_signed_at,
          closed_at
        `)
        .eq('id', dealId)
        .single();

      if (error) throw error;
      return data as DealStageInfo;
    },
    enabled: !!dealId
  });

  // Fetch stage history
  const { data: stageHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['deal-stage-history', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_stage_history')
        .select('*')
        .eq('deal_id', dealId)
        .order('entered_at', { ascending: false });

      if (error) throw error;
      return data as StageHistoryEntry[];
    },
    enabled: !!dealId
  });

  // Check stage progression triggers
  const { data: progressionCheck, refetch: recheckProgression } = useQuery({
    queryKey: ['deal-stage-progression', dealId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_deal_stage_triggers', {
        p_deal_id: dealId
      });

      if (error) throw error;
      return data as unknown as StageProgressionCheck;
    },
    enabled: !!dealId,
    refetchInterval: 30000 // Check every 30 seconds
  });

  // Progress stage mutation
  const progressStageMutation = useMutation({
    mutationFn: async ({ 
      newStage, 
      triggeredBy = 'manual', 
      triggerEvent 
    }: { 
      newStage: DealStage; 
      triggeredBy?: 'auto' | 'manual';
      triggerEvent?: string;
    }) => {
      const { data, error } = await supabase.rpc('progress_deal_stage', {
        p_deal_id: dealId,
        p_new_stage: newStage,
        p_triggered_by: triggeredBy,
        p_trigger_event: triggerEvent || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deal-stage-info', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-stage-history', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-stage-progression', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-activities', dealId] });
      
      const result = data as { success: boolean; old_stage: string; new_stage: string };
      if (result.success) {
        toast.success(`Deal progressed to ${STAGE_LABELS[result.new_stage as DealStage]}`);
      }
      setShowProgressionAlert(false);
    },
    onError: (error) => {
      toast.error('Failed to progress stage: ' + error.message);
    }
  });

  // Update deal timestamps mutation
  const updateDealTimestampMutation = useMutation({
    mutationFn: async ({ 
      field, 
      value 
    }: { 
      field: keyof DealStageInfo;
      value: string | null;
    }) => {
      const { error } = await supabase
        .from('deals')
        .update({ [field]: value })
        .eq('id', dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-stage-info', dealId] });
      recheckProgression();
    }
  });

  // Calculate days in current stage
  const calculateDaysInStage = useCallback((stageEnteredAt: string | null): number => {
    if (!stageEnteredAt) return 0;
    const entered = new Date(stageEnteredAt);
    const now = new Date();
    return Math.floor((now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  // Get completed stages
  const getCompletedStages = useCallback((): DealStage[] => {
    if (!stageInfo?.current_stage) return [];
    const currentIndex = STAGE_ORDER.indexOf(stageInfo.current_stage as DealStage);
    return STAGE_ORDER.slice(0, currentIndex);
  }, [stageInfo?.current_stage]);

  // Progress to next stage
  const progressToNextStage = useCallback(() => {
    if (!stageInfo?.current_stage) return;
    const currentIndex = STAGE_ORDER.indexOf(stageInfo.current_stage as DealStage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      progressStageMutation.mutate({
        newStage: STAGE_ORDER[currentIndex + 1],
        triggeredBy: 'manual'
      });
    }
  }, [stageInfo?.current_stage, progressStageMutation]);

  // Accept progression suggestion
  const acceptProgressionSuggestion = useCallback(() => {
    if (progressionCheck?.should_progress && progressionCheck.suggested_stage) {
      progressStageMutation.mutate({
        newStage: progressionCheck.suggested_stage,
        triggeredBy: 'auto',
        triggerEvent: progressionCheck.trigger_event || undefined
      });
    }
  }, [progressionCheck, progressStageMutation]);

  // Manual stage change
  const manuallyMoveStage = useCallback((newStage: DealStage, reason?: string) => {
    progressStageMutation.mutate({
      newStage,
      triggeredBy: 'manual',
      triggerEvent: reason || 'manual_override'
    });
  }, [progressStageMutation]);

  // Mark milestone timestamps
  const markNdaSigned = useCallback(() => {
    updateDealTimestampMutation.mutate({
      field: 'first_nda_signed_at',
      value: new Date().toISOString()
    });
  }, [updateDealTimestampMutation]);

  const markLoiSubmitted = useCallback(() => {
    updateDealTimestampMutation.mutate({
      field: 'loi_submitted_at',
      value: new Date().toISOString()
    });
  }, [updateDealTimestampMutation]);

  const markLoiAccepted = useCallback(() => {
    updateDealTimestampMutation.mutate({
      field: 'loi_accepted_at',
      value: new Date().toISOString()
    });
  }, [updateDealTimestampMutation]);

  const markPurchaseAgreementSigned = useCallback(() => {
    updateDealTimestampMutation.mutate({
      field: 'purchase_agreement_signed_at',
      value: new Date().toISOString()
    });
  }, [updateDealTimestampMutation]);

  const markDealClosed = useCallback(() => {
    updateDealTimestampMutation.mutate({
      field: 'closed_at',
      value: new Date().toISOString()
    });
  }, [updateDealTimestampMutation]);

  return {
    // Data
    stageInfo,
    stageHistory,
    progressionCheck,
    
    // Loading states
    isLoadingStageInfo,
    isLoadingHistory,
    isProgressing: progressStageMutation.isPending,
    
    // Computed values
    currentStage: stageInfo?.current_stage as DealStage | undefined,
    completedStages: getCompletedStages(),
    daysInCurrentStage: calculateDaysInStage(stageInfo?.stage_entered_at || null),
    
    // Alert state
    showProgressionAlert,
    setShowProgressionAlert,
    
    // Actions
    progressToNextStage,
    acceptProgressionSuggestion,
    manuallyMoveStage,
    recheckProgression,
    
    // Milestone markers
    markNdaSigned,
    markLoiSubmitted,
    markLoiAccepted,
    markPurchaseAgreementSigned,
    markDealClosed
  };
};
