import React, { useState } from 'react';
import { Eye, Star, FileCheck, TrendingUp, Download, Clock, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvestorActivity } from '@/hooks/useInvestorProfileStats';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

interface ActivityHistoryTabProps {
  activities: InvestorActivity[];
  loading: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
  view: <Eye className="w-4 h-4 text-blue-500" />,
  nda: <FileCheck className="w-4 h-4 text-green-500" />,
  watchlist: <Star className="w-4 h-4 text-yellow-500" />,
  interest: <TrendingUp className="w-4 h-4 text-purple-500" />,
  access_request: <Clock className="w-4 h-4 text-orange-500" />,
  document: <Download className="w-4 h-4 text-cyan-500" />,
};

const activityLabels: Record<string, string> = {
  view: 'Deal View',
  nda: 'NDA Signed',
  watchlist: 'Watchlist',
  interest: 'Interest',
  access_request: 'Access Request',
  document: 'Document',
};

export const ActivityHistoryTab: React.FC<ActivityHistoryTabProps> = ({
  activities,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.dealName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp);
    let groupKey: string;
    
    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(date)) {
      groupKey = 'This Week';
    } else {
      groupKey = 'Earlier';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(activity);
    return groups;
  }, {} as Record<string, InvestorActivity[]>);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="view">Views</SelectItem>
                <SelectItem value="nda">NDAs</SelectItem>
                <SelectItem value="watchlist">Watchlist</SelectItem>
                <SelectItem value="interest">Interests</SelectItem>
                <SelectItem value="access_request">Access Requests</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" disabled className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center justify-between">
            <span>Activity Timeline</span>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredActivities.length} of {activities.length} activities
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No activity found</p>
              <p className="text-sm">Your activity history will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupOrder.map(groupKey => {
                const groupActivities = groupedActivities[groupKey];
                if (!groupActivities || groupActivities.length === 0) return null;
                
                return (
                  <div key={groupKey}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      {groupKey}
                    </h3>
                    <div className="space-y-2">
                      {groupActivities.map((activity) => (
                        <div 
                          key={activity.id}
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                        >
                          <div className="mt-1 p-2 rounded-full bg-muted">
                            {activityIcons[activity.type] || <Eye className="w-4 h-4 text-gray-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {activity.description}
                                </p>
                                {activity.dealName && (
                                  <p className="text-sm text-[hsl(var(--primary))] hover:underline cursor-pointer">
                                    {activity.dealName}
                                  </p>
                                )}
                              </div>
                              <span 
                                className="text-xs text-muted-foreground whitespace-nowrap"
                                title={format(new Date(activity.timestamp), 'PPpp')}
                              >
                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
