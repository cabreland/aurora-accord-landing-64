import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealActivity } from '@/hooks/useDealActivities';
import { ActivityItem } from './ActivityItem';
import { ActivityGroupHeader } from './ActivityGroupHeader';

interface GroupedActivities {
  label: string;
  activities: DealActivity[];
  isToday: boolean;
}

interface ActivityTimelineProps {
  activities: DealActivity[];
  isLoading: boolean;
  onNavigate?: (entityType: string, entityId: string | null) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  newActivityIds?: Set<string>;
  onRefresh?: () => void;
}

const groupActivitiesByDate = (activities: DealActivity[]): GroupedActivities[] => {
  const groups: Map<string, DealActivity[]> = new Map();
  
  activities.forEach(activity => {
    const date = new Date(activity.created_at);
    let label: string;
    let sortKey: number;
    
    if (isToday(date)) {
      label = 'Today';
      sortKey = 0;
    } else if (isYesterday(date)) {
      label = 'Yesterday';
      sortKey = 1;
    } else if (isThisWeek(date)) {
      label = 'This Week';
      sortKey = 2;
    } else if (isThisMonth(date)) {
      label = 'This Month';
      sortKey = 3;
    } else {
      label = format(date, 'MMMM yyyy');
      sortKey = 4 + (2100 - date.getFullYear()) * 12 + (12 - date.getMonth());
    }
    
    const existing = groups.get(label) || [];
    groups.set(label, [...existing, activity]);
  });
  
  return Array.from(groups.entries())
    .map(([label, activities]) => ({
      label,
      activities,
      isToday: label === 'Today',
    }));
};

const ActivitySkeleton: React.FC = () => (
  <div className="flex items-start gap-3 p-4 border-l-4 border-muted rounded-lg bg-card/50">
    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

const EmptyState: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6 shadow-inner">
      <Activity className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
    <p className="text-muted-foreground max-w-sm mb-4">
      Upload documents, create requests, or add team members to see activity here.
    </p>
    {onRefresh && (
      <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    )}
  </div>
);

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  isLoading,
  onNavigate,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  newActivityIds = new Set(),
  onRefresh,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const groupedActivities = useMemo(() => groupActivitiesByDate(activities), [activities]);

  // Infinite scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 200;
    
    if (isNearBottom && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4, 5].map(i => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return <EmptyState onRefresh={onRefresh} />;
  }

  return (
    <ScrollArea 
      className="h-[600px]" 
      onScrollCapture={handleScroll}
      ref={scrollRef}
    >
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[1.625rem] top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />
        
        {groupedActivities.map((group, groupIndex) => (
          <div key={group.label}>
            <ActivityGroupHeader 
              label={group.label} 
              count={group.activities.length}
              isToday={group.isToday}
            />
            <div className="space-y-3 p-4">
              {group.activities.map((activity, index) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity}
                  onNavigate={onNavigate}
                  isNew={newActivityIds.has(activity.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="gap-2"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
