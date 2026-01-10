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
import { formatDistanceToNow, differenceInDays, isBefore, parseISO } from 'date-fns';
import { useDealActivities, getActivityDescription, getActivityIcon, getActivityColor } from '@/hooks/useDealActivities';
import { useDealTeam, getRoleDisplayName, getRoleColor } from '@/hooks/useDealTeam';
import { useDiligenceRequests } from '@/hooks/useDiligenceTracker';
import { useDataRoom } from '@/hooks/useDataRoom';
import { useDealStageManager, STAGE_ORDER, DealStage as StageType } from '@/hooks/useDealStageManager';
import { cn } from '@/lib/utils';
import { DealTab } from './DealWorkspaceTabs';
import { 
  DealHealthScorecard, 
  DiligenceStageTimeline, 
  BottlenecksWidget, 
  OutstandingItemsWidget,
  StageProgressionAlert,
  type DiligenceStage,
  type Bottleneck,
  type OutstandingItem 
} from './overview';
import * as Icons from 'lucide-react';

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
  const { data: activities = [], isLoading: activitiesLoading } = useDealActivities(deal.id, 10);
  const { data: teamMembers = [], isLoading: teamLoading } = useDealTeam(deal.id);
  const { data: requests = [], isLoading: requestsLoading } = useDiligenceRequests(deal.id);
  const { folders, documents, loading: dataRoomLoading } = useDataRoom({ dealId: deal.id });
  
  // Use the stage manager hook for real stage data
  const {
    currentStage: dbCurrentStage,
    completedStages: dbCompletedStages,
    daysInCurrentStage: dbDaysInStage,
    progressionCheck,
    showProgressionAlert,
    setShowProgressionAlert,
    acceptProgressionSuggestion,
    isProgressing,
    isLoadingStageInfo
  } = useDealStageManager(deal.id);

  // Calculate comprehensive metrics
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
    const answeredRequests = requests.filter(r => r.status === 'completed' || r.status === 'in_progress').length;
    
    // Calculate document completion percentage
    const documentCompletion = requiredFolders.length > 0 
      ? Math.round((completedRequired / requiredFolders.length) * 100)
      : (totalDocuments > 0 ? 100 : 0);
    
    // Calculate request response rate
    const requestResponseRate = totalRequests > 0 
      ? Math.round((answeredRequests / totalRequests) * 100)
      : 100;
    
    // Calculate team engagement (based on team size and activity)
    const teamEngagement = teamMembers.length >= 3 ? 100 : 
      teamMembers.length > 0 ? Math.round((teamMembers.length / 3) * 100) : 0;
    
    // Overall health score
    const overallCompletion = Math.round(
      (documentCompletion * 0.35) + 
      (requestResponseRate * 0.35) + 
      (teamEngagement * 0.3)
    );

    // Determine timeline status based on overdue requests
    const overdueRequests = requests.filter(r => 
      r.due_date && 
      isBefore(parseISO(r.due_date), new Date()) && 
      r.status !== 'completed'
    );
    const timelineStatus: 'on_track' | 'at_risk' | 'critical' = 
      overdueRequests.length > 3 ? 'critical' :
      overdueRequests.length > 0 ? 'at_risk' : 'on_track';

    return {
      totalFolders,
      totalDocuments,
      openRequests,
      completedRequests,
      totalRequests,
      answeredRequests,
      overallCompletion,
      documentCompletion,
      requestResponseRate,
      teamEngagement,
      timelineStatus,
      requiredFolders: requiredFolders.length,
      completedRequired,
    };
  }, [folders, documents, requests, teamMembers]);

  // Determine current diligence stage - use database value if available, otherwise compute
  const currentStage = useMemo((): DiligenceStage => {
    // Map database stage to DiligenceStage type
    if (dbCurrentStage) {
      const stageMap: Record<StageType, DiligenceStage> = {
        'deal_initiated': 'initiated',
        'information_request': 'information_request',
        'analysis': 'analysis',
        'final_review': 'final_review',
        'closing': 'closing'
      };
      return stageMap[dbCurrentStage] || 'initiated';
    }
    // Fallback to computed stage
    if (deal.status === 'closed') return 'closing';
    if (metrics.overallCompletion >= 90) return 'final_review';
    if (metrics.overallCompletion >= 50) return 'analysis';
    if (metrics.overallCompletion > 0) return 'information_request';
    return 'initiated';
  }, [dbCurrentStage, deal.status, metrics.overallCompletion]);

  const completedStages = useMemo((): DiligenceStage[] => {
    // Use database completed stages if available
    if (dbCompletedStages && dbCompletedStages.length > 0) {
      return dbCompletedStages.map(s => {
        const stageMap: Record<StageType, DiligenceStage> = {
          'deal_initiated': 'initiated',
          'information_request': 'information_request',
          'analysis': 'analysis',
          'final_review': 'final_review',
          'closing': 'closing'
        };
        return stageMap[s] || 'initiated';
      });
    }
    // Fallback to computed stages
    const stages: DiligenceStage[] = [];
    if (currentStage !== 'initiated') stages.push('initiated');
    if (['analysis', 'final_review', 'closing'].includes(currentStage)) stages.push('information_request');
    if (['final_review', 'closing'].includes(currentStage)) stages.push('analysis');
    if (currentStage === 'closing') stages.push('final_review');
    return stages;
  }, [dbCompletedStages, currentStage]);

  // Calculate days in current stage - use database value if available
  const daysInCurrentStage = useMemo(() => {
    if (dbDaysInStage !== undefined) return dbDaysInStage;
    return differenceInDays(new Date(), parseISO(deal.created_at));
  }, [dbDaysInStage, deal.created_at]);

  // Show progression alert when trigger is met
  React.useEffect(() => {
    if (progressionCheck?.should_progress && !showProgressionAlert) {
      setShowProgressionAlert(true);
    }
  }, [progressionCheck?.should_progress, showProgressionAlert, setShowProgressionAlert]);

  // Generate bottlenecks
  const bottlenecks = useMemo((): Bottleneck[] => {
    const issues: Bottleneck[] = [];
    
    // Check for empty required folders
    const emptyRequiredFolders = folders.filter(f => 
      f.is_required && !documents.some(d => d.folder_id === f.id)
    );
    if (emptyRequiredFolders.length > 0) {
      issues.push({
        id: 'missing-docs',
        severity: 'critical',
        type: 'documents',
        title: `${emptyRequiredFolders.length} required folder${emptyRequiredFolders.length > 1 ? 's' : ''} missing documents`,
        description: emptyRequiredFolders.slice(0, 2).map(f => f.name).join(', '),
        targetTab: 'data-room',
      });
    }

    // Check for overdue requests
    const overdueRequests = requests.filter(r => 
      r.due_date && 
      isBefore(parseISO(r.due_date), new Date()) && 
      r.status !== 'completed'
    );
    overdueRequests.forEach(r => {
      const daysDiff = differenceInDays(new Date(), parseISO(r.due_date!));
      issues.push({
        id: `overdue-${r.id}`,
        severity: daysDiff > 7 ? 'critical' : 'warning',
        type: 'requests',
        title: r.title,
        description: `${r.category?.name || 'Request'} is overdue`,
        daysOutstanding: daysDiff,
        targetTab: 'requests',
      });
    });

    // Check for no team members
    if (teamMembers.length === 0) {
      issues.push({
        id: 'no-team',
        severity: 'warning',
        type: 'team',
        title: 'No team members assigned',
        description: 'Add team members to collaborate on this deal',
        targetTab: 'team',
      });
    }

    // Sort by severity
    return issues.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [folders, documents, requests, teamMembers]);

  // Generate outstanding items
  const outstandingItems = useMemo((): OutstandingItem[] => {
    const items: OutstandingItem[] = [];

    // Open requests with due dates
    requests
      .filter(r => r.status !== 'completed' && r.due_date)
      .forEach(r => {
        items.push({
          id: `req-${r.id}`,
          type: 'request',
          title: r.title,
          description: r.category?.name,
          dueDate: r.due_date ? parseISO(r.due_date) : undefined,
          priority: r.priority,
          targetTab: 'requests',
        });
      });

    // Required folders without documents
    folders
      .filter(f => f.is_required && !documents.some(d => d.folder_id === f.id))
      .forEach(f => {
        items.push({
          id: `folder-${f.id}`,
          type: 'document',
          title: `Upload documents to ${f.name}`,
          description: 'Required folder',
          targetTab: 'data-room',
        });
      });

    return items;
  }, [requests, folders, documents]);

  const lastActivity = activities[0];

  const handleBottleneckResolve = (bottleneck: Bottleneck) => {
    onTabChange(bottleneck.targetTab);
  };

  const handleOutstandingItemClick = (item: OutstandingItem) => {
    onTabChange(item.targetTab);
  };

  const handleStageClick = (stage: DiligenceStage) => {
    // Could filter activity/docs by stage in future
    onTabChange('activity');
  };

  const isLoading = activitiesLoading || teamLoading || requestsLoading || dataRoomLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stage Progression Alert - Show when trigger is met */}
      {showProgressionAlert && progressionCheck?.should_progress && progressionCheck.suggested_stage && dbCurrentStage && (
        <StageProgressionAlert
          currentStage={dbCurrentStage}
          suggestedStage={progressionCheck.suggested_stage}
          triggerEvent={progressionCheck.trigger_event}
          onAccept={acceptProgressionSuggestion}
          onDismiss={() => setShowProgressionAlert(false)}
          isProgressing={isProgressing}
        />
      )}

      {/* Deal Health Scorecard */}
      <DealHealthScorecard
        overallScore={metrics.overallCompletion}
        documentCompletion={metrics.documentCompletion}
        requestResponseRate={metrics.requestResponseRate}
        teamEngagement={metrics.teamEngagement}
        timelineStatus={metrics.timelineStatus}
        trend={0}
        documentsTotal={metrics.requiredFolders || metrics.totalFolders}
        documentsCompleted={metrics.completedRequired}
        requestsTotal={metrics.totalRequests}
        requestsAnswered={metrics.answeredRequests}
        teamSize={teamMembers.length}
      />

      {/* Bottlenecks Alert - Only if issues exist */}
      {bottlenecks.length > 0 && (
        <BottlenecksWidget
          bottlenecks={bottlenecks}
          onResolve={handleBottleneckResolve}
        />
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onTabChange('data-room')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{metrics.totalDocuments}</p>
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
                <p className="text-2xl font-bold tabular-nums">{metrics.openRequests}</p>
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
                <p className="text-2xl font-bold tabular-nums">{metrics.overallCompletion}%</p>
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

      {/* Progress Timeline */}
      <DiligenceStageTimeline
        currentStage={currentStage}
        completedStages={completedStages}
        daysInCurrentStage={daysInCurrentStage}
      />

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Key Information */}
          <Card>
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

          {/* Outstanding Items */}
          <OutstandingItemsWidget
            items={outstandingItems}
            onItemClick={handleOutstandingItemClick}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
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
              {activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  No activity yet
                </p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map(activity => {
                    const iconName = getActivityIcon(activity.activity_type);
                    const IconComponent = (Icons as any)[iconName] || Activity;
                    const colorClass = getActivityColor(activity.activity_type);

                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={cn(
                          'p-1.5 rounded-lg bg-muted/50',
                          colorClass
                        )}>
                          <IconComponent className="h-3.5 w-3.5" />
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
                    );
                  })}
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
              {teamMembers.length === 0 ? (
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
                  {teamMembers.slice(0, 4).map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white',
                        getAvatarColor(member.user_id)
                      )}>
                        {member.user ? getUserInitials(member.user) : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
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
                  {teamMembers.length > 4 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onTabChange('team')}
                    >
                      +{teamMembers.length - 4} more
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
