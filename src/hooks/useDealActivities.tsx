import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useCallback } from 'react';
import { ActivityFilter } from '@/components/deal-workspace/activity/ActivityFilters';
import { DateRange } from 'react-day-picker';

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
  | 'request_answered'
  | 'comment_added'
  | 'team_member_added'
  | 'team_member_removed'
  | 'permission_changed'
  | 'nda_signed'
  | 'deal_stage_changed'
  | 'deal_created'
  | 'deal_updated'
  | 'folder_created'
  | 'mention';

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

interface UseFilteredActivitiesOptions {
  filter?: ActivityFilter;
  searchQuery?: string;
  dateRange?: DateRange;
  limit?: number;
}

// Map filter to activity types
const getActivityTypesForFilter = (filter: ActivityFilter): DealActivityType[] | null => {
  switch (filter) {
    case 'documents':
      return ['document_uploaded', 'document_deleted', 'document_moved', 'document_approved', 'document_rejected', 'document_downloaded'];
    case 'requests':
      return ['request_created', 'request_updated', 'request_status_changed', 'request_completed', 'request_answered', 'comment_added'];
    case 'team':
      return ['team_member_added', 'team_member_removed', 'permission_changed'];
    case 'all':
    case 'my_activity':
    default:
      return null; // All types
  }
};

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

export const useFilteredDealActivities = (
  dealId: string | undefined,
  options: UseFilteredActivitiesOptions = {}
) => {
  const { filter = 'all', searchQuery = '', dateRange, limit = 30 } = options;
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['deal-activities-filtered', dealId, filter, searchQuery, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async ({ pageParam = 0 }) => {
      if (!dealId) return { activities: [], nextCursor: null };

      let query = supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      // Apply activity type filter
      const activityTypes = getActivityTypesForFilter(filter);
      if (activityTypes) {
        query = query.in('activity_type', activityTypes as unknown as any[]);
      }

      // Apply "my activity" filter
      if (filter === 'my_activity' && user?.id) {
        query = query.eq('user_id', user.id);
      }

      // Apply date range filter
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      const { data: activities, error } = await query;

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(activities?.map(a => a.user_id).filter(Boolean))] as string[];

      // Fetch profiles
      let profileMap = new Map();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', userIds);
        profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      }

      // Enrich activities with user data
      let enrichedActivities = (activities || []).map(activity => ({
        ...activity,
        activity_type: activity.activity_type as DealActivityType,
        metadata: activity.metadata as Record<string, unknown>,
        user: activity.user_id ? profileMap.get(activity.user_id) || null : null,
      })) as DealActivity[];

      // Apply search filter (client-side for now)
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        enrichedActivities = enrichedActivities.filter(activity => {
          const userName = activity.user?.first_name || activity.user?.last_name || activity.user?.email || '';
          const metadata = JSON.stringify(activity.metadata).toLowerCase();
          const activityType = activity.activity_type.toLowerCase().replace(/_/g, ' ');
          
          return (
            userName.toLowerCase().includes(lowerQuery) ||
            metadata.includes(lowerQuery) ||
            activityType.includes(lowerQuery)
          );
        });
      }

      return {
        activities: enrichedActivities,
        nextCursor: enrichedActivities.length === limit ? pageParam + limit : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!dealId,
  });
};

// Real-time subscription hook
export const useDealActivitiesRealtime = (dealId: string | undefined) => {
  const queryClient = useQueryClient();
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!dealId) return;

    const channel = supabase
      .channel(`deal-activities-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deal_activities',
          filter: `deal_id=eq.${dealId}`,
        },
        (payload) => {
          console.log('New activity received:', payload);
          // Mark as new for animation
          setNewActivityIds(prev => new Set(prev).add(payload.new.id));
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['deal-activities', dealId] });
          queryClient.invalidateQueries({ queryKey: ['deal-activities-filtered', dealId] });
          
          // Clear "new" state after animation
          setTimeout(() => {
            setNewActivityIds(prev => {
              const next = new Set(prev);
              next.delete(payload.new.id);
              return next;
            });
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, queryClient]);

  return { newActivityIds };
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
        p_activity_type: activityType as unknown as any,
        p_entity_type: entityType,
        p_entity_id: entityId || null,
        p_metadata: metadata as unknown as Record<string, never>,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-activities', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-activities-filtered', variables.dealId] });
    },
  });
};

// Helper function to get activity description
export const getActivityDescription = (activity: DealActivity): string => {
  const metadata = activity.metadata || {};
  
  switch (activity.activity_type) {
    case 'document_uploaded':
      return `uploaded "${metadata.file_name || 'a document'}"${metadata.folder_name ? ` to ${metadata.folder_name}` : ''}`;
    case 'document_deleted':
      return `deleted "${metadata.file_name || 'a document'}"`;
    case 'document_approved':
      return `approved "${metadata.file_name || 'a document'}"`;
    case 'document_rejected':
      return `rejected "${metadata.file_name || 'a document'}"${metadata.rejection_reason ? `: ${metadata.rejection_reason}` : ''}`;
    case 'document_downloaded':
      return `downloaded "${metadata.file_name || 'a document'}"`;
    case 'document_moved':
      return `moved "${metadata.file_name || 'a document'}" to ${metadata.destination_folder || 'another folder'}`;
    case 'request_created':
      return `created ${metadata.priority ? `a ${metadata.priority}` : 'a'} ${metadata.category || ''} request: "${metadata.title || ''}"`;
    case 'request_updated':
      return `updated request "${metadata.title || ''}"`;
    case 'request_status_changed':
      return `changed request status${metadata.old_status ? ` from ${metadata.old_status}` : ''} to "${metadata.new_status || ''}"`;
    case 'request_completed':
      return `completed request "${metadata.title || ''}"`;
    case 'request_answered':
      return `answered request "${metadata.title || ''}"`;
    case 'comment_added':
      return `added a comment${metadata.request_title ? ` on "${metadata.request_title}"` : ''}`;
    case 'team_member_added':
      return `added ${metadata.member_name || 'a team member'} to the team${metadata.role ? ` as ${metadata.role}` : ''}`;
    case 'team_member_removed':
      return `removed ${metadata.member_name || 'a team member'} from the team`;
    case 'permission_changed':
      return `changed permissions for ${metadata.member_name || 'a team member'}`;
    case 'nda_signed':
      return `signed the NDA`;
    case 'deal_stage_changed':
      return `changed deal stage${metadata.old_stage ? ` from ${metadata.old_stage}` : ''} to "${metadata.new_stage || ''}"`;
    case 'deal_created':
      return `created this deal`;
    case 'deal_updated':
      return `updated deal information`;
    case 'folder_created':
      return `created folder "${metadata.folder_name || ''}"`;
    case 'mention':
      return `mentioned ${metadata.mentioned_user || 'someone'} in ${metadata.context || 'a comment'}`;
    default:
      return 'performed an action';
  }
};

// Helper to get activity icon name
export const getActivityIcon = (activityType: DealActivityType): string => {
  switch (activityType) {
    case 'document_uploaded':
      return 'FileUp';
    case 'document_downloaded':
      return 'Download';
    case 'document_deleted':
      return 'Trash2';
    case 'document_approved':
      return 'CheckCircle';
    case 'document_rejected':
      return 'XCircle';
    case 'document_moved':
      return 'FolderInput';
    case 'request_created':
    case 'request_updated':
      return 'ClipboardList';
    case 'request_status_changed':
    case 'request_completed':
    case 'request_answered':
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
    case 'folder_created':
      return 'FolderPlus';
    case 'mention':
      return 'AtSign';
    default:
      return 'Activity';
  }
};

// Helper to get activity color
export const getActivityColor = (activityType: DealActivityType): string => {
  switch (activityType) {
    case 'document_approved':
    case 'request_completed':
    case 'request_answered':
    case 'nda_signed':
      return 'text-green-500';
    case 'document_rejected':
    case 'document_deleted':
    case 'team_member_removed':
      return 'text-red-500';
    case 'document_uploaded':
    case 'request_created':
    case 'team_member_added':
    case 'folder_created':
      return 'text-blue-500';
    case 'request_status_changed':
    case 'deal_stage_changed':
      return 'text-amber-500';
    case 'document_downloaded':
      return 'text-indigo-500';
    case 'comment_added':
    case 'mention':
      return 'text-purple-500';
    default:
      return 'text-muted-foreground';
  }
};

// Export utility for PDF/Excel
export const exportActivities = async (
  activities: DealActivity[],
  format: 'csv' | 'json' = 'csv'
): Promise<void> => {
  const data = activities.map(a => ({
    date: new Date(a.created_at).toISOString(),
    user: a.user ? `${a.user.first_name || ''} ${a.user.last_name || ''}`.trim() || a.user.email : 'Unknown',
    action: a.activity_type.replace(/_/g, ' '),
    description: getActivityDescription(a),
    entity_type: a.entity_type,
    metadata: JSON.stringify(a.metadata),
  }));

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'activity-log.json');
  } else {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => 
      Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'activity-log.csv');
  }
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
