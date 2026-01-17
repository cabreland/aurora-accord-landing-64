import React from 'react';
import { Activity, MessageSquare, FileText, CheckCircle, UserPlus, ChevronRight, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'note' | 'document' | 'status' | 'invite';
  description: string;
  dealId?: string;
  timestamp: string;
}

const activityIcons = {
  note: MessageSquare,
  document: FileText,
  status: CheckCircle,
  invite: UserPlus,
};

const activityColors = {
  note: 'bg-blue-100 text-blue-600',
  document: 'bg-emerald-100 text-emerald-600',
  status: 'bg-purple-100 text-purple-600',
  invite: 'bg-amber-100 text-amber-600',
};

const mapActivityType = (type: string): 'note' | 'document' | 'status' | 'invite' => {
  if (type.includes('document') || type.includes('upload')) return 'document';
  if (type.includes('status') || type.includes('stage')) return 'status';
  if (type.includes('invite') || type.includes('team')) return 'invite';
  return 'note';
};

const formatActivityDescription = (activity: any): string => {
  const metadata = activity.metadata || {};
  switch (activity.activity_type) {
    case 'document_uploaded':
      return `Document uploaded: ${metadata.file_name || 'New document'}`;
    case 'document_approved':
      return `Document approved: ${metadata.file_name || 'Document'}`;
    case 'document_rejected':
      return `Document rejected: ${metadata.file_name || 'Document'}`;
    case 'status_changed':
      return `Deal moved to ${metadata.new_stage || 'new stage'}`;
    case 'team_member_added':
      return `Team member added to deal`;
    case 'comment_added':
      return `New comment added`;
    case 'request_created':
      return `New diligence request created`;
    case 'request_completed':
      return `Diligence request completed`;
    default:
      return activity.activity_type?.replace(/_/g, ' ') || 'Activity recorded';
  }
};

export const RecentActivityWidget = () => {
  const navigate = useNavigate();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['dashboard-recent-activity'],
    queryFn: async () => {
      // Fetch from deal_activities, joining with deals to filter real deals only
      const { data, error } = await supabase
        .from('deal_activities')
        .select(`
          id,
          activity_type,
          metadata,
          created_at,
          deal:deals!inner(
            id,
            company_name,
            is_test_data
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filter to only real deals and format
      const realActivities = (data || [])
        .filter((a: any) => a.deal && a.deal.is_test_data === false)
        .slice(0, 6)
        .map((a: any): ActivityItem => ({
          id: a.id,
          type: mapActivityType(a.activity_type),
          description: `${formatActivityDescription(a)} – ${a.deal.company_name}`,
          dealId: a.deal.id,
          timestamp: formatDistanceToNow(new Date(a.created_at), { addSuffix: true }),
        }));

      return realActivities;
    },
  });

  const handleClick = (activity: ActivityItem) => {
    if (activity.dealId) {
      navigate(`/deals/${activity.dealId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36 mt-1" />
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-3.5 flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Latest updates across deals</p>
          </div>
        </div>
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No recent activity yet</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <div
                key={activity.id}
                onClick={() => handleClick(activity)}
                className={cn(
                  "px-5 py-3.5 flex items-start gap-3 transition-colors",
                  activity.dealId && "hover:bg-muted/50 cursor-pointer group"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  activityColors[activity.type]
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm text-foreground",
                    activity.dealId && "group-hover:text-[#D4AF37] transition-colors"
                  )}>
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.timestamp}
                  </p>
                </div>
                {activity.dealId && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
