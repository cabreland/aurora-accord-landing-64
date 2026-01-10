import React, { useMemo } from 'react';
import { 
  Building2, 
  DollarSign, 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp,
  FileText,
  ClipboardList,
  CheckCircle,
  Activity,
  Upload,
  Plus,
  UserPlus,
  FileDown,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useDealActivities, getActivityDescription } from '@/hooks/useDealActivities';
import { useDealTeam, getRoleDisplayName, getRoleColor } from '@/hooks/useDealTeam';
import { useDiligenceRequests } from '@/hooks/useDiligenceTracker';
import { useDataRoom } from '@/hooks/useDataRoom';
import { cn } from '@/lib/utils';
import { DealTab } from './DealWorkspaceTabs';

interface DealOverviewTabProps {
  deal: {
    id: string;
    title: string;
    company_name: string;
    industry?: string | null;
    location?: string | null;
    revenue?: string | null;
    ebitda?: string | null;
    asking_price?: string | null;
    team_size?: string | null;
    founded_year?: number | null;
    status: string;
    priority: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
  };
  onTabChange: (tab: DealTab) => void;
}

const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
  ];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
};

const getUserInitials = (user: { first_name?: string | null; last_name?: string | null; email?: string }): string => {
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email?.[0]?.toUpperCase() || '?';
};

export const DealOverviewTab: React.FC<DealOverviewTabProps> = ({ deal, onTabChange }) => {
  const { data: activities = [], isLoading: activitiesLoading } = useDealActivities(deal.id, 5);
  const { data: teamMembers = [], isLoading: teamLoading } = useDealTeam(deal.id);
  const { data: requests = [], isLoading: requestsLoading } = useDiligenceRequests(deal.id);
  const { folders, documents, loading: dataRoomLoading } = useDataRoom({ dealId: deal.id });

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalFolders = folders.length;
    const totalDocuments = documents.length;
    const requiredFolders = folders.filter(f => f.is_required);
    const completedRequired = requiredFolders.filter(f => 
      documents.some(d => d.folder_id === f.id)
    ).length;
    
    const openRequests = requests.filter(r => r.status !== 'completed').length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const totalRequests = requests.length;
    
    // Calculate completion percentage
    const folderCompletion = requiredFolders.length > 0 
      ? (completedRequired / requiredFolders.length) * 50 
      : 50;
    const requestCompletion = totalRequests > 0 
      ? (completedRequests / totalRequests) * 50 
      : 50;
    const overallCompletion = Math.round(folderCompletion + requestCompletion);

    return {
      totalFolders,
      totalDocuments,
      openRequests,
      completedRequests,
      totalRequests,
      overallCompletion,
    };
  }, [folders, documents, requests]);

  const lastActivity = activities[0];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="capitalize">
              {deal.status}
            </Badge>
            <Badge 
              className={cn(
                deal.priority === 'high' && 'bg-red-100 text-red-800',
                deal.priority === 'medium' && 'bg-amber-100 text-amber-800',
                deal.priority === 'low' && 'bg-green-100 text-green-800',
              )}
            >
              {deal.priority} Priority
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {deal.industry || 'Industry not specified'} • {deal.location || 'Location not specified'}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Created {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}</p>
          <p>Updated {formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true })}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onTabChange('data-room')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalDocuments}</p>
                <p className="text-sm text-muted-foreground">
                  Documents / {metrics.totalFolders} folders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onTabChange('requests')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.openRequests}</p>
                <p className="text-sm text-muted-foreground">
                  Open / {metrics.totalRequests} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{metrics.overallCompletion}%</p>
                <Progress value={metrics.overallCompletion} className="h-1.5 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onTabChange('activity')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Last Activity</p>
                <p className="text-sm text-muted-foreground">
                  {lastActivity 
                    ? formatDistanceToNow(new Date(lastActivity.created_at), { addSuffix: true })
                    : 'No activity yet'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Information & Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Key Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Key Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Revenue</span>
                </div>
                <p className="font-semibold">{deal.revenue || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">EBITDA</span>
                </div>
                <p className="font-semibold">{deal.ebitda || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Asking Price</span>
                </div>
                <p className="font-semibold">{deal.asking_price || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="font-semibold">{deal.location || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Team Size</span>
                </div>
                <p className="font-semibold">{deal.team_size || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Founded</span>
                </div>
                <p className="font-semibold">{deal.founded_year || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onTabChange('data-room')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onTabChange('requests')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Request
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onTabChange('team')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileDown className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Team */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange('activity')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No activity yet
              </p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0',
                      getAvatarColor(activity.user_id || '')
                    )}>
                      {activity.user ? getUserInitials(activity.user) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.user?.first_name || activity.user?.email?.split('@')[0] || 'Someone'}
                        </span>
                        {' '}
                        <span className="text-muted-foreground">
                          {getActivityDescription(activity)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
              {teamMembers.length > 0 && (
                <Badge variant="secondary">{teamMembers.length}</Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange('team')}
            >
              Manage
            </Button>
          </CardHeader>
          <CardContent>
            {teamLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">No team members yet</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onTabChange('team')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.slice(0, 5).map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white',
                      getAvatarColor(member.user_id)
                    )}>
                      {member.user ? getUserInitials(member.user) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {member.user?.first_name || member.user?.last_name 
                          ? `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim()
                          : member.user?.email || 'Unknown'
                        }
                      </p>
                      <Badge className={cn('text-xs', getRoleColor(member.role))}>
                        {getRoleDisplayName(member.role)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {teamMembers.length > 5 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onTabChange('team')}
                  >
                    +{teamMembers.length - 5} more
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
