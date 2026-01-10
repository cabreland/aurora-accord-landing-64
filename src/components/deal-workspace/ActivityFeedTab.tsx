import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { 
  useFilteredDealActivities, 
  useDealActivitiesRealtime,
  exportActivities,
  DealActivity
} from '@/hooks/useDealActivities';
import { 
  ActivityFilters, 
  ActivityFilter,
  ActivityTimeline 
} from './activity';

interface ActivityFeedTabProps {
  dealId: string;
}

export const ActivityFeedTab: React.FC<ActivityFeedTabProps> = ({ dealId }) => {
  const navigate = useNavigate();
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  // Fetch activities with filters
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFilteredDealActivities(dealId, {
    filter: activeFilter,
    searchQuery,
    dateRange,
  });

  // Real-time updates
  const { newActivityIds } = useDealActivitiesRealtime(dealId);

  // Flatten paginated data
  const activities = useMemo(() => {
    return data?.pages.flatMap(page => page.activities) || [];
  }, [data]);

  // Handle navigation to entity
  const handleNavigate = useCallback((entityType: string, entityId: string | null) => {
    if (!entityId) return;

    switch (entityType) {
      case 'document':
        // Navigate to data room with document highlighted
        navigate(`/deals/${dealId}?tab=data-room&doc=${entityId}`);
        break;
      case 'request':
        // Navigate to requests tab with request modal open
        navigate(`/deals/${dealId}?tab=requests&request=${entityId}`);
        break;
      case 'team':
        // Navigate to team tab
        navigate(`/deals/${dealId}?tab=team`);
        break;
      case 'folder':
        // Navigate to data room with folder selected
        navigate(`/deals/${dealId}?tab=data-room&folder=${entityId}`);
        break;
      default:
        // Default to overview
        navigate(`/deals/${dealId}?tab=overview`);
    }
  }, [dealId, navigate]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (activities.length === 0) {
      toast.error('No activities to export');
      return;
    }

    setIsExporting(true);
    try {
      await exportActivities(activities, 'csv');
      toast.success('Activity log exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export activity log');
    } finally {
      setIsExporting(false);
    }
  }, [activities]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
    toast.success('Activity feed refreshed');
  }, [refetch]);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            Activity Feed
            <Badge variant="secondary" className="ml-2">
              {activities.length} events
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <ActivityFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={handleExport}
          totalCount={activities.length}
          isExporting={isExporting}
        />

        {/* Timeline */}
        <ActivityTimeline
          activities={activities}
          isLoading={isLoading}
          onNavigate={handleNavigate}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          newActivityIds={newActivityIds}
          onRefresh={handleRefresh}
        />
      </CardContent>
    </Card>
  );
};

export default ActivityFeedTab;
