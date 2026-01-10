import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type DealActivityType =
  | 'document_uploaded'
  | 'document_deleted'
  | 'document_moved'
  | 'document_approved'
  | 'document_rejected'
  | 'document_downloaded'
  | 'request_created'
  | 'request_updated'
  | 'request_status_changed'
  | 'request_completed'
  | 'comment_added'
  | 'team_member_added'
  | 'team_member_removed'
  | 'permission_changed'
  | 'nda_signed'
  | 'deal_stage_changed'
  | 'deal_created'
  | 'deal_updated';

export interface DealActivity {
  id: string;
  deal_id: string;
  user_id: string | null;
  activity_type: DealActivityType;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined data
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export const useDealActivities = (dealId: string | undefined, limit = 50) => {
  return useQuery({
    queryKey: ['deal-activities', dealId, limit],
    queryFn: async () => {
      if (!dealId) return [];

      const { data: activities, error } = await supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(activities?.map(a => a.user_id).filter(Boolean))] as string[];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Enrich activities with user data
      return (activities || []).map(activity => ({
        ...activity,
        activity_type: activity.activity_type as DealActivityType,
        metadata: activity.metadata as Record<string, unknown>,
        user: activity.user_id ? profileMap.get(activity.user_id) || null : null,
      })) as DealActivity[];
    },
    enabled: !!dealId,
  });
};

export const useLogDealActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      activityType,
      entityType,
      entityId,
      metadata = {},
    }: {
      dealId: string;
      activityType: DealActivityType;
      entityType: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.rpc('log_deal_activity', {
        p_deal_id: dealId,
        p_activity_type: activityType,
        p_entity_type: entityType,
        p_entity_id: entityId || null,
        p_metadata: metadata as unknown as Record<string, never>,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-activities', variables.dealId] });
    },
  });
};

// Helper function to get activity description
export const getActivityDescription = (activity: DealActivity): string => {
  const metadata = activity.metadata || {};
  
  switch (activity.activity_type) {
    case 'document_uploaded':
      return `uploaded "${metadata.file_name || 'a document'}"`;
    case 'document_deleted':
      return `deleted "${metadata.file_name || 'a document'}"`;
    case 'document_approved':
      return `approved "${metadata.file_name || 'a document'}"`;
    case 'document_rejected':
      return `rejected "${metadata.file_name || 'a document'}"${metadata.rejection_reason ? `: ${metadata.rejection_reason}` : ''}`;
    case 'document_downloaded':
      return `downloaded "${metadata.file_name || 'a document'}"`;
    case 'request_created':
      return `created request "${metadata.title || ''}"`;
    case 'request_updated':
      return `updated request "${metadata.title || ''}"`;
    case 'request_status_changed':
      return `changed request status to "${metadata.new_status || ''}"`;
    case 'request_completed':
      return `completed request "${metadata.title || ''}"`;
    case 'comment_added':
      return `added a comment`;
    case 'team_member_added':
      return `added ${metadata.member_name || 'a team member'}`;
    case 'team_member_removed':
      return `removed ${metadata.member_name || 'a team member'}`;
    case 'permission_changed':
      return `changed permissions for ${metadata.member_name || 'a team member'}`;
    case 'nda_signed':
      return `signed the NDA`;
    case 'deal_stage_changed':
      return `changed deal stage to "${metadata.new_stage || ''}"`;
    case 'deal_created':
      return `created this deal`;
    case 'deal_updated':
      return `updated deal information`;
    default:
      return 'performed an action';
  }
};

// Helper to get activity icon name
export const getActivityIcon = (activityType: DealActivityType): string => {
  switch (activityType) {
    case 'document_uploaded':
    case 'document_downloaded':
      return 'FileUp';
    case 'document_deleted':
      return 'Trash2';
    case 'document_approved':
      return 'CheckCircle';
    case 'document_rejected':
      return 'XCircle';
    case 'request_created':
    case 'request_updated':
      return 'ClipboardList';
    case 'request_status_changed':
    case 'request_completed':
      return 'CheckSquare';
    case 'comment_added':
      return 'MessageSquare';
    case 'team_member_added':
    case 'team_member_removed':
      return 'Users';
    case 'permission_changed':
      return 'Shield';
    case 'nda_signed':
      return 'FileCheck';
    case 'deal_stage_changed':
      return 'Target';
    case 'deal_created':
    case 'deal_updated':
      return 'Briefcase';
    default:
      return 'Activity';
  }
};

// Helper to get activity color
export const getActivityColor = (activityType: DealActivityType): string => {
  switch (activityType) {
    case 'document_approved':
    case 'request_completed':
    case 'nda_signed':
      return 'text-green-500';
    case 'document_rejected':
    case 'document_deleted':
    case 'team_member_removed':
      return 'text-red-500';
    case 'document_uploaded':
    case 'request_created':
    case 'team_member_added':
      return 'text-blue-500';
    case 'request_status_changed':
    case 'deal_stage_changed':
      return 'text-amber-500';
    default:
      return 'text-muted-foreground';
  }
};
