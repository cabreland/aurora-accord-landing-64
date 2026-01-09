import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatSmartTimestamp } from '@/lib/formatTimestamp';
import { getUserInitials, getUserDisplayName } from '@/components/common/UserAvatarBadge';

export interface RequestActivityItem {
  id: string;
  type: 'created' | 'status' | 'assigned' | 'priority' | 'comment' | 'reply' | 'resolved' | 'reopened' | 'description';
  content: string;
  userName: string;
  userInitials: string;
  timestamp: string;
  formattedTime: string;
}

export const useRequestActivity = (requestId: string) => {
  return useQuery({
    queryKey: ['request-activity', requestId],
    queryFn: async (): Promise<RequestActivityItem[]> => {
      if (!requestId) return [];

      // Fetch request details
      const { data: request, error: requestError } = await supabase
        .from('diligence_requests')
        .select('id, title, status, created_at, updated_at, created_by, updated_by, assignee_id, assignee_ids, priority')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Fetch comments for this request
      const { data: comments, error: commentsError } = await supabase
        .from('diligence_comments')
        .select('id, content, created_at, user_id, parent_comment_id, comment_type, approved_at, approved_by')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Error fetching comments for activity:', commentsError);
      }

      // Collect all user IDs
      const userIds = new Set<string>();
      if (request.created_by) userIds.add(request.created_by);
      if (request.updated_by) userIds.add(request.updated_by);
      if (request.assignee_id) userIds.add(request.assignee_id);
      request.assignee_ids?.forEach((id: string) => userIds.add(id));
      comments?.forEach(c => {
        if (c.user_id) userIds.add(c.user_id);
        if (c.approved_by) userIds.add(c.approved_by);
      });

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, role')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const getProfileInfo = (userId: string | null) => {
        if (!userId) return { name: 'System', initials: 'SY' };
        const profile = profileMap.get(userId);
        if (profile) {
          return {
            name: getUserDisplayName(profile.first_name, profile.last_name, profile.email),
            initials: getUserInitials(profile.first_name, profile.last_name, profile.email)
          };
        }
        return { name: 'Unknown User', initials: '??' };
      };

      const activities: RequestActivityItem[] = [];

      // Add created activity
      const creatorInfo = getProfileInfo(request.created_by);
      activities.push({
        id: 'created',
        type: 'created',
        content: 'Request created',
        userName: creatorInfo.name,
        userInitials: creatorInfo.initials,
        timestamp: request.created_at,
        formattedTime: formatSmartTimestamp(request.created_at)
      });

      // Add assignment activity
      const assigneeIds = request.assignee_ids?.length > 0 
        ? request.assignee_ids 
        : request.assignee_id 
          ? [request.assignee_id] 
          : [];
      
      if (assigneeIds.length > 0) {
        const assigneeNames = assigneeIds
          .map((id: string) => getProfileInfo(id).name)
          .join(', ');
        
        activities.push({
          id: 'assigned',
          type: 'assigned',
          content: `Assigned to ${assigneeNames}`,
          userName: getProfileInfo(request.updated_by || request.created_by).name,
          userInitials: getProfileInfo(request.updated_by || request.created_by).initials,
          timestamp: request.updated_at,
          formattedTime: formatSmartTimestamp(request.updated_at)
        });
      }

      // Add status activity if not open
      if (request.status !== 'open') {
        const statusLabels: Record<string, string> = {
          in_progress: 'In Progress',
          completed: 'Resolved',
          blocked: 'Blocked'
        };
        
        activities.push({
          id: 'status',
          type: request.status === 'completed' ? 'resolved' : 'status',
          content: `Status changed to ${statusLabels[request.status] || request.status}`,
          userName: getProfileInfo(request.updated_by).name,
          userInitials: getProfileInfo(request.updated_by).initials,
          timestamp: request.updated_at,
          formattedTime: formatSmartTimestamp(request.updated_at)
        });
      }

      // Add comment activities
      for (const comment of comments || []) {
        const commenterInfo = getProfileInfo(comment.user_id);
        const isReply = !!comment.parent_comment_id;
        
        activities.push({
          id: `comment-${comment.id}`,
          type: isReply ? 'reply' : 'comment',
          content: isReply ? 'Posted a reply' : 'Added a comment',
          userName: commenterInfo.name,
          userInitials: commenterInfo.initials,
          timestamp: comment.created_at,
          formattedTime: formatSmartTimestamp(comment.created_at)
        });
      }

      // Sort by timestamp descending
      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return activities;
    },
    enabled: !!requestId,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};
