import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatActivityTimestamp } from '@/lib/formatTimestamp';

export interface DiligenceActivity {
  id: string;
  type: 'completed' | 'comment' | 'blocked' | 'uploaded' | 'created' | 'updated';
  user_initials: string;
  user_name: string;
  request_title: string;
  deal_name: string;
  created_at: string;
  time_ago: string;
  description: string;
}

// Get icon/color for activity type
export const getActivityStyle = (type: DiligenceActivity['type']) => {
  switch (type) {
    case 'completed':
      return { icon: '🟢', color: 'text-green-600', bgColor: 'bg-green-50' };
    case 'comment':
      return { icon: '🟡', color: 'text-amber-600', bgColor: 'bg-amber-50' };
    case 'blocked':
      return { icon: '🔴', color: 'text-red-600', bgColor: 'bg-red-50' };
    case 'uploaded':
      return { icon: '📁', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    case 'created':
      return { icon: '➕', color: 'text-purple-600', bgColor: 'bg-purple-50' };
    case 'updated':
      return { icon: '✏️', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    default:
      return { icon: '📋', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  }
};

export const useDiligenceActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['diligence-activity', limit],
    queryFn: async (): Promise<DiligenceActivity[]> => {
      // Get recently updated/created diligence requests
      const { data: requests, error: requestsError } = await supabase
        .from('diligence_requests')
        .select(`
          id,
          title,
          status,
          updated_at,
          created_at,
          deal_id
        `)
        .order('updated_at', { ascending: false })
        .limit(limit * 2);

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        throw requestsError;
      }

      // Get recent comments
      const { data: comments, error: commentsError } = await supabase
        .from('diligence_comments')
        .select(`
          id,
          request_id,
          content,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      }

      // Get deals info for context
      const { data: deals } = await supabase
        .from('deals')
        .select('id, company_name');

      const dealMap = new Map(deals?.map(d => [d.id, d.company_name]) || []);

      // Build activity feed
      const activities: DiligenceActivity[] = [];

      // Add request activities
      for (const req of requests || []) {
        const dealName = dealMap.get(req.deal_id) || 'Unknown Deal';
        const timeAgo = formatActivityTimestamp(req.updated_at);
        
        // Determine activity type based on status
        let type: DiligenceActivity['type'] = 'updated';
        let description = `updated "${req.title}"`;
        
        if (req.status === 'completed') {
          type = 'completed';
          description = `completed "${req.title}"`;
        } else if (req.status === 'blocked') {
          type = 'blocked';
          description = `flagged "${req.title}" as blocked`;
        } else if (new Date(req.created_at).getTime() === new Date(req.updated_at).getTime()) {
          type = 'created';
          description = `created "${req.title}"`;
        }

        activities.push({
          id: req.id,
          type,
          user_initials: 'SA', // Mock - would need user join
          user_name: 'Sarah Adams',
          request_title: req.title,
          deal_name: dealName,
          created_at: req.updated_at,
          time_ago: timeAgo,
          description
        });
      }

      // Add comment activities
      for (const comment of comments || []) {
        const request = requests?.find(r => r.id === comment.request_id);
        if (!request) continue;

        const dealName = dealMap.get(request.deal_id) || 'Unknown Deal';
        const timeAgo = formatActivityTimestamp(comment.created_at);

        activities.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          user_initials: 'MK', // Mock - would need user join
          user_name: 'Mike Kim',
          request_title: request.title,
          deal_name: dealName,
          created_at: comment.created_at,
          time_ago: timeAgo,
          description: `added comment on "${request.title}"`
        });
      }

      // Sort by time and limit
      activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return activities.slice(0, limit);
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
