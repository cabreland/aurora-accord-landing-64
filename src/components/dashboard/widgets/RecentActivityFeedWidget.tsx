import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  FileText, 
  MessageSquare, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Plus,
  Upload,
  Mail,
  FileDown
} from 'lucide-react';
import { RecentActivity } from '@/hooks/useMissionControl';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityFeedWidgetProps {
  activities: RecentActivity[];
  loading: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'document_uploaded':
      return <FileText className="w-4 h-4 text-primary" />;
    case 'document_approved':
      return <CheckCircle className="w-4 h-4 text-success" />;
    case 'document_rejected':
      return <XCircle className="w-4 h-4 text-destructive" />;
    case 'request_created':
    case 'request_updated':
    case 'request_status_changed':
      return <RefreshCw className="w-4 h-4 text-warning" />;
    case 'comment_added':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'team_member_added':
      return <UserPlus className="w-4 h-4 text-purple-500" />;
    case 'stage_changed':
    case 'status_changed':
      return <Activity className="w-4 h-4 text-primary" />;
    default:
      return <Activity className="w-4 h-4 text-muted-foreground" />;
  }
};

export const RecentActivityFeedWidget: React.FC<RecentActivityFeedWidgetProps> = ({
  activities,
  loading
}) => {
  if (loading) {
    return (
      <Card className="p-6 bg-card border border-border shadow-sm h-full">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border border-border shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Across all deals</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px]">
          {activities.slice(0, 10).map((activity) => (
            <Link
              key={activity.id}
              to={`/deal/${activity.deal_id}`}
              className="block"
            >
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={activity.user_avatar} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {activity.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.activity_type)}
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user_name}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary truncate group-hover:underline">
                      {activity.deal_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="pt-4 mt-4 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/deals?action=create">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
          <Link to="/documents?action=upload">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </Link>
          <Link to="/investor-invitations">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileDown className="w-4 h-4 mr-2" />
              Report
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
