import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  MessageSquare, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { RecentActivity } from '@/hooks/useMissionControl';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityFeedWidgetProps {
  activities: RecentActivity[];
  loading: boolean;
}

const getActivityIcon = (type: string) => {
  const iconClass = "w-3.5 h-3.5";
  switch (type) {
    case 'document_uploaded':
      return <FileText className={`${iconClass} text-blue-500`} />;
    case 'document_approved':
      return <CheckCircle className={`${iconClass} text-emerald-500`} />;
    case 'document_rejected':
      return <XCircle className={`${iconClass} text-red-500`} />;
    case 'request_created':
    case 'request_updated':
    case 'request_status_changed':
      return <RefreshCw className={`${iconClass} text-amber-500`} />;
    case 'comment_added':
      return <MessageSquare className={`${iconClass} text-purple-500`} />;
    case 'team_member_added':
      return <UserPlus className={`${iconClass} text-indigo-500`} />;
    default:
      return <Activity className={`${iconClass} text-gray-400`} />;
  }
};

export const RecentActivityFeedWidget: React.FC<RecentActivityFeedWidgetProps> = ({
  activities,
  loading
}) => {
  if (loading) {
    return (
      <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl h-full">
        <Skeleton className="h-4 w-28 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Recent Activity
        </span>
        <span className="text-xs text-gray-400">
          Last 24 hours
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto">
          {activities.slice(0, 8).map((activity) => (
            <Link
              key={activity.id}
              to={`/deal/${activity.deal_id}`}
              className="block group"
            >
              <div className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarImage src={activity.user_avatar} />
                  <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600 font-medium">
                    {activity.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-medium text-gray-900">{activity.user_name.split(' ')[0]}</span>
                    {' '}
                    <span className="text-gray-500">{activity.action}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getActivityIcon(activity.activity_type)}
                    <span className="text-xs text-gray-400 truncate group-hover:text-blue-500 transition-colors">
                      {activity.deal_name}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: false })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activities.length > 8 && (
        <Link 
          to="/activity" 
          className="mt-4 pt-4 border-t border-gray-100 text-center block"
        >
          <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all activity →
          </span>
        </Link>
      )}
    </Card>
  );
};
