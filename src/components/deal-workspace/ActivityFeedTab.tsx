import React, { useMemo } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { 
  FileUp, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ClipboardList, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  Shield, 
  FileCheck, 
  Target, 
  Briefcase,
  Activity,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  useDealActivities, 
  DealActivity, 
  getActivityDescription, 
  getActivityColor 
} from '@/hooks/useDealActivities';
import { cn } from '@/lib/utils';

interface ActivityFeedTabProps {
  dealId: string;
}

const iconMap: Record<string, React.ElementType> = {
  FileUp,
  Trash2,
  CheckCircle,
  XCircle,
  ClipboardList,
  CheckSquare,
  MessageSquare,
  Users,
  Shield,
  FileCheck,
  Target,
  Briefcase,
  Activity,
  Download,
};

const getIcon = (activityType: string): React.ElementType => {
  switch (activityType) {
    case 'document_uploaded':
    case 'document_downloaded':
      return FileUp;
    case 'document_deleted':
      return Trash2;
    case 'document_approved':
      return CheckCircle;
    case 'document_rejected':
      return XCircle;
    case 'request_created':
    case 'request_updated':
      return ClipboardList;
    case 'request_status_changed':
    case 'request_completed':
      return CheckSquare;
    case 'comment_added':
      return MessageSquare;
    case 'team_member_added':
    case 'team_member_removed':
      return Users;
    case 'permission_changed':
      return Shield;
    case 'nda_signed':
      return FileCheck;
    case 'deal_stage_changed':
      return Target;
    case 'deal_created':
    case 'deal_updated':
      return Briefcase;
    default:
      return Activity;
  }
};

const getUserInitials = (user: DealActivity['user']): string => {
  if (!user) return '?';
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email?.[0]?.toUpperCase() || '?';
};

const getUserName = (user: DealActivity['user']): string => {
  if (!user) return 'Unknown User';
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return user.email?.split('@')[0] || 'Unknown';
};

const getAvatarColor = (userId: string | null): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
  ];
  if (!userId) return colors[0];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
};

interface GroupedActivities {
  label: string;
  activities: DealActivity[];
}

const groupActivitiesByDate = (activities: DealActivity[]): GroupedActivities[] => {
  const groups: Map<string, DealActivity[]> = new Map();
  
  activities.forEach(activity => {
    const date = new Date(activity.created_at);
    let label: string;
    
    if (isToday(date)) {
      label = 'Today';
    } else if (isYesterday(date)) {
      label = 'Yesterday';
    } else if (isThisWeek(date)) {
      label = 'This Week';
    } else {
      label = format(date, 'MMMM yyyy');
    }
    
    const existing = groups.get(label) || [];
    groups.set(label, [...existing, activity]);
  });
  
  return Array.from(groups.entries()).map(([label, activities]) => ({
    label,
    activities,
  }));
};

const ActivityItem: React.FC<{ activity: DealActivity }> = ({ activity }) => {
  const Icon = getIcon(activity.activity_type);
  const colorClass = getActivityColor(activity.activity_type);
  
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
      {/* User Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0',
        getAvatarColor(activity.user_id)
      )}>
        {getUserInitials(activity.user)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">
            {getUserName(activity.user)}
          </span>
          <span className="text-muted-foreground">
            {getActivityDescription(activity)}
          </span>
        </div>
        
        {/* Metadata preview */}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <div className="mt-1 text-sm text-muted-foreground">
            {activity.metadata.file_name && (
              <Badge variant="secondary" className="text-xs">
                {String(activity.metadata.file_name)}
              </Badge>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <div className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </div>
      </div>
      
      {/* Icon */}
      <div className={cn('shrink-0', colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
};

const ActivitySkeleton: React.FC = () => (
  <div className="flex items-start gap-3 p-3">
    <Skeleton className="w-8 h-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

export const ActivityFeedTab: React.FC<ActivityFeedTabProps> = ({ dealId }) => {
  const { data: activities = [], isLoading } = useDealActivities(dealId);
  
  const groupedActivities = useMemo(() => groupActivitiesByDate(activities), [activities]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No activity yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Upload documents or create requests to see activity here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
          <Badge variant="secondary" className="ml-2">
            {activities.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="divide-y">
            {groupedActivities.map(group => (
              <div key={group.label}>
                <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </div>
                <div className="px-2">
                  {group.activities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
