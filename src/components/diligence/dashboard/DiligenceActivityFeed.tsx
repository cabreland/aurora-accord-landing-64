import React from 'react';
import { Activity, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiligenceActivity, getActivityStyle } from '@/hooks/useDiligenceActivity';

interface DiligenceActivityFeedProps {
  onViewAll?: () => void;
}

const DiligenceActivityFeed: React.FC<DiligenceActivityFeedProps> = ({ onViewAll }) => {
  const { data: activities = [], isLoading, error } = useDiligenceActivity(8);

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">Unable to load activity feed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Recent Activity
            <span className="text-xs text-gray-400 font-normal">(Last 24 Hours)</span>
          </CardTitle>
          {activities.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Activity will appear here as your team works</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
            {activities.map((activity, index) => {
              const style = getActivityStyle(activity.type);
              
              return (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  {/* Activity indicator */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${style.bgColor}`}>
                      {style.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">
                      <span className="font-medium">{activity.user_initials}</span>
                      <span className="text-gray-500"> {activity.description}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{activity.time_ago}</span>
                      <span className="text-gray-300">•</span>
                      <span className="truncate">{activity.deal_name}</span>
                    </div>
                  </div>
                  
                  {/* Arrow on hover */}
                  <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              );
            })}
          </div>
        )}
        
        {activities.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={onViewAll}
          >
            View All Activity
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DiligenceActivityFeed;
