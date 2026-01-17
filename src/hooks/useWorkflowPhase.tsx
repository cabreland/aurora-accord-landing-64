import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

export type WorkflowPhase = Database['public']['Enums']['workflow_phase'];

// Sell-side phases (preparation)
export const SELL_SIDE_PHASES: WorkflowPhase[] = [
  'listing_received',
  'under_review',
  'listing_approved',
  'data_room_build',
  'qa_compliance',
  'ready_for_distribution'
];

// Buy-side phases (active deal)
export const BUY_SIDE_PHASES: WorkflowPhase[] = [
  'live_active',
  'under_loi',
  'due_diligence',
  'closing',
  'closed'
];

export const WORKFLOW_PHASE_LABELS: Record<WorkflowPhase, string> = {
  listing_received: 'Listing Received',
  under_review: 'Under Review',
  listing_approved: 'Listing Approved',
  data_room_build: 'Data Room Build',
  qa_compliance: 'QA & Compliance',
  ready_for_distribution: 'Ready for Distribution',
  live_active: 'Live & Active',
  under_loi: 'Under LOI',
  due_diligence: 'Due Diligence',
  closing: 'Closing',
  closed: 'Closed'
};

export const WORKFLOW_PHASE_COLORS: Record<WorkflowPhase, string> = {
  listing_received: 'bg-slate-500/20 text-slate-700',
  under_review: 'bg-yellow-500/20 text-yellow-700',
  listing_approved: 'bg-blue-500/20 text-blue-700',
  data_room_build: 'bg-amber-500/20 text-amber-700',
  qa_compliance: 'bg-purple-500/20 text-purple-700',
  ready_for_distribution: 'bg-cyan-500/20 text-cyan-700',
  live_active: 'bg-green-500/20 text-green-700',
  under_loi: 'bg-indigo-500/20 text-indigo-700',
  due_diligence: 'bg-orange-500/20 text-orange-700',
  closing: 'bg-rose-500/20 text-rose-700',
  closed: 'bg-emerald-500/20 text-emerald-700'
};

export const isSellSidePhase = (phase: WorkflowPhase | null | undefined): boolean => {
  if (!phase) return true;
  return SELL_SIDE_PHASES.includes(phase);
};

export const isBuySidePhase = (phase: WorkflowPhase | null | undefined): boolean => {
  if (!phase) return false;
  return BUY_SIDE_PHASES.includes(phase);
};

export interface WorkflowPhaseInfo {
  workflow_phase: WorkflowPhase | null;
  listing_received_at: string | null;
  listing_approved_at: string | null;
  data_room_complete_at: string | null;
  deal_published_at: string | null;
}

export const useWorkflowPhase = (dealId: string) => {
  const queryClient = useQueryClient();

  // Fetch workflow phase info
  const { data: phaseInfo, isLoading } = useQuery({
    queryKey: ['deal-workflow-phase', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          workflow_phase,
          listing_received_at,
          listing_approved_at,
          data_room_complete_at,
          deal_published_at
        `)
        .eq('id', dealId)
        .single();

      if (error) throw error;
      return data as WorkflowPhaseInfo;
    },
    enabled: !!dealId
  });

  // Update workflow phase mutation
  const updatePhaseMutation = useMutation({
    mutationFn: async (newPhase: WorkflowPhase) => {
      const { error } = await supabase
        .from('deals')
        .update({ workflow_phase: newPhase })
        .eq('id', dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-workflow-phase', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
      toast.success('Workflow phase updated');
    },
    onError: (error) => {
      toast.error('Failed to update workflow phase: ' + error.message);
    }
  });

  // Update milestone timestamp mutation
  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ 
      field, 
      value 
    }: { 
      field: keyof WorkflowPhaseInfo;
      value: string | null;
    }) => {
      const { error } = await supabase
        .from('deals')
        .update({ [field]: value })
        .eq('id', dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-workflow-phase', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-stage-info', dealId] });
    }
  });

  // Publish deal mutation
  const publishDealMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('deals')
        .update({ 
          workflow_phase: 'live_active' as WorkflowPhase,
          deal_published_at: new Date().toISOString()
        })
        .eq('id', dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-workflow-phase', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-stage-info', dealId] });
      toast.success('Deal is now live for buyers!');
    },
    onError: (error) => {
      toast.error('Failed to publish deal: ' + error.message);
    }
  });

  // Mark milestones
  const markListingReceived = useCallback(() => {
    updateMilestoneMutation.mutate({
      field: 'listing_received_at',
      value: new Date().toISOString()
    });
  }, [updateMilestoneMutation]);

  const markListingApproved = useCallback(() => {
    updateMilestoneMutation.mutate({
      field: 'listing_approved_at',
      value: new Date().toISOString()
    });
  }, [updateMilestoneMutation]);

  const markDataRoomComplete = useCallback(() => {
    updateMilestoneMutation.mutate({
      field: 'data_room_complete_at',
      value: new Date().toISOString()
    });
  }, [updateMilestoneMutation]);

  return {
    // Data
    phaseInfo,
    currentPhase: phaseInfo?.workflow_phase || null,
    
    // Computed
    isSellSide: isSellSidePhase(phaseInfo?.workflow_phase),
    isBuySide: isBuySidePhase(phaseInfo?.workflow_phase),
    
    // Loading states
    isLoading,
    isUpdating: updatePhaseMutation.isPending || publishDealMutation.isPending,
    
    // Actions
    updatePhase: updatePhaseMutation.mutate,
    publishDeal: publishDealMutation.mutate,
    
    // Milestone markers
    markListingReceived,
    markListingApproved,
    markDataRoomComplete,
    updateMilestone: updateMilestoneMutation.mutate
  };
};
