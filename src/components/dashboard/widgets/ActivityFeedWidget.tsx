import React from 'react';
import { WidgetContainer } from '../shared/WidgetContainer';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { Activity, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeedWidget = () => {
  const { activities, loading } = useActivityFeed(10);

  if (loading) {
    return (
      <WidgetContainer title="Recent Activity" icon={Activity}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Recent Activity" icon={Activity}>
      <div className="space-y-4">
        {activities.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Activity className="w-8 h-8 text-[#D4AF37]/50 mx-auto mb-2" />
            <p className="text-sm text-[#F4E4BC]/60">No recent activity</p>
          </div>
        )}

        <div className="pt-3 border-t border-[#D4AF37]/20">
          <button className="text-sm text-[#D4AF37] hover:text-[#F4E4BC] transition-colors w-full text-center">
            View All Activity →
          </button>
        </div>
      </div>
    </WidgetContainer>
  );
};

const ActivityItem = ({ activity }: { activity: any }) => {
  const getIcon = () => {
    // You would import these dynamically or have a mapping
    switch (activity.icon) {
      case 'LogIn':
        return '🔑';
      case 'FileCheck':
        return '📋';
      case 'Building2':
        return '🏢';
      case 'Handshake':
        return '🤝';
      case 'Upload':
        return '📁';
      case 'Unlock':
        return '🔓';
      default:
        return '📝';
    }
  };

  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

  return (
    <div className="flex gap-3 p-2 rounded-lg hover:bg-[#1A1F2E] transition-colors">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
        style={{ backgroundColor: `${activity.color}20` }}
      >
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#FAFAFA] leading-tight mb-1">
          {activity.description}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-[#F4E4BC]/60">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};