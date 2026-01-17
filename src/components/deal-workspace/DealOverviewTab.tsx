import React, { useMemo } from 'react';
import { 
  Upload,
  Plus,
  UserPlus,
  FileDown,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, isBefore, parseISO } from 'date-fns';
import { useDealActivities, getActivityDescription, getActivityIcon, getActivityColor } from '@/hooks/useDealActivities';
import { useDealTeam } from '@/hooks/useDealTeam';
import { useDiligenceRequests } from '@/hooks/useDiligenceTracker';
import { useDataRoom } from '@/hooks/useDataRoom';
import { useWorkflowPhase } from '@/hooks/useWorkflowPhase';
import { useDataRoomHealth } from '@/hooks/useDataRoomHealth';
import { useDDCompleteness } from '@/hooks/useDDCompleteness';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { DealTab } from './DealWorkspaceTabs';
import { 
  DealStatusHeader,
  AttentionRequiredCard,
  DealPipelineProgress,
  DataRoomStatusCard,
  KeyInformationCard,
  TeamCollaborationCard,
  PublishDealButton,
  type AttentionAlert,
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
    growth_rate?: string | null;
    listing_received_at?: string | null;
    listing_approved_at?: string | null;
    data_room_complete_at?: string | null;
    first_nda_signed_at?: string | null;
    loi_submitted_at?: string | null;
    loi_accepted_at?: string | null;
    purchase_agreement_signed_at?: string | null;
    closed_at?: string | null;
  };
  onTabChange: (tab: DealTab) => void;
}

export const DealOverviewTab: React.FC<DealOverviewTabProps> = ({ deal, onTabChange }) => {
  const { user } = useAuth();
  const { data: activities = [], isLoading: activitiesLoading } = useDealActivities(deal.id, 10);
  const { data: teamMembers = [], isLoading: teamLoading } = useDealTeam(deal.id);
  const { data: requests = [], isLoading: requestsLoading } = useDiligenceRequests(deal.id);
  const { folders, documents, loading: dataRoomLoading } = useDataRoom({ dealId: deal.id });
  
  const { 
    currentPhase, 
    isSellSide, 
    isBuySide, 
    isLoading: phaseLoading,
    publishDeal,
    isUpdating: isPublishing
  } = useWorkflowPhase(deal.id);
  
  const dataRoomHealth = useDataRoomHealth(deal.id);
  const ddCompleteness = useDDCompleteness(deal.id);

  // Build milestones map
  const milestones = useMemo(() => ({
    listing_received: deal.listing_received_at || deal.created_at,
    under_review: null, // No specific timestamp for this
    listing_approved: deal.listing_approved_at,
    data_room_build: null,
    qa_compliance: null,
    ready_for_distribution: deal.data_room_complete_at,
    live_active: deal.first_nda_signed_at,
    under_loi: deal.loi_submitted_at,
    due_diligence: deal.loi_accepted_at,
    closing: deal.purchase_agreement_signed_at,
    closed: deal.closed_at,
  }), [deal]);

  // Calculate folder stats for DataRoomStatusCard
  const folderStats = useMemo(() => {
    const foldersWithCounts = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      is_required: folder.is_required || false,
      documentCount: documents.filter(d => d.folder_id === folder.id).length,
    }));

    const foldersWithDocs = foldersWithCounts.filter(f => f.documentCount > 0).length;
    const pendingReview = documents.filter(d => d.status === 'pending_review').length;

    return {
      folders: foldersWithCounts,
      foldersWithDocuments: foldersWithDocs,
      totalDocuments: documents.length,
      pendingReview,
    };
  }, [folders, documents]);

  // Generate attention alerts
  const alerts = useMemo((): AttentionAlert[] => {
    const items: AttentionAlert[] = [];
    
    // Check for empty required folders
    const emptyRequiredFolders = folders.filter(f => 
      f.is_required && !documents.some(d => d.folder_id === f.id)
    );
    if (emptyRequiredFolders.length > 0) {
      items.push({
        id: 'missing-docs',
        severity: 'critical',
        type: 'data-room',
        title: `${emptyRequiredFolders.length} required folder${emptyRequiredFolders.length > 1 ? 's' : ''} missing documents`,
        description: emptyRequiredFolders.slice(0, 3).map(f => f.name).join(', '),
        actionLabel: 'Resolve',
        onAction: () => onTabChange('data-room'),
      });
    }

    // Check for no team members
    if (teamMembers.length === 0) {
      items.push({
        id: 'no-team',
        severity: 'warning',
        type: 'team',
        title: 'No team members assigned',
        description: 'Add team members to collaborate on this deal',
        actionLabel: 'Add Team',
        onAction: () => onTabChange('team'),
      });
    }

    // Check for low data room completion
    if (dataRoomHealth.healthPercentage < 50 && dataRoomHealth.healthPercentage > 0) {
      items.push({
        id: 'low-data-room',
        severity: 'warning',
        type: 'documents',
        title: `Data room only ${dataRoomHealth.healthPercentage}% complete`,
        description: 'Upload documents to required folders',
        actionLabel: 'Upload',
        onAction: () => onTabChange('data-room'),
      });
    }

    // Check for overdue requests (buy-side)
    if (isBuySide) {
      const overdueRequests = requests.filter(r => 
        r.due_date && 
        isBefore(parseISO(r.due_date), new Date()) && 
        r.status !== 'completed'
      );
      if (overdueRequests.length > 0) {
        items.push({
          id: 'overdue-requests',
          severity: 'critical',
          type: 'requests',
          title: `${overdueRequests.length} overdue request${overdueRequests.length > 1 ? 's' : ''}`,
          description: 'Respond to buyer requests to keep deal on track',
          actionLabel: 'View Requests',
          onAction: () => onTabChange('requests'),
        });
      }
    }

    return items.sort((a, b) => {
      const order = { critical: 0, warning: 1 };
      return order[a.severity] - order[b.severity];
    });
  }, [folders, documents, teamMembers, dataRoomHealth.healthPercentage, requests, isBuySide, onTabChange]);

  const canSubmitForReview = dataRoomHealth.healthPercentage >= 80 && teamMembers.length > 0;
  
  const handleSubmitForReview = () => {
    // This would trigger the review submission flow
    onTabChange('settings');
  };

  const isLoading = activitiesLoading || teamLoading || requestsLoading || dataRoomLoading || phaseLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Deal Status Header - Current phase, health, quick actions */}
      <DealStatusHeader
        deal={deal}
        currentPhase={currentPhase}
        healthPercentage={isSellSide ? dataRoomHealth.healthPercentage : ddCompleteness.completionPercentage}
        ownerName={user?.email?.split('@')[0] || 'Unknown'}
        canSubmitForReview={canSubmitForReview}
        onSubmitForReview={handleSubmitForReview}
        onSettingsClick={() => onTabChange('settings')}
      />

      {/* 2. Attention Required - Critical items first */}
      <AttentionRequiredCard alerts={alerts} />

      {/* 3. Publish Deal Button (when ready) */}
      {currentPhase === 'ready_for_distribution' && dataRoomHealth.isComplete && (
        <div className="flex justify-center py-4">
          <PublishDealButton
            companyName={deal.company_name}
            dataRoomHealthPercentage={dataRoomHealth.healthPercentage}
            isPublishing={isPublishing}
            onPublish={publishDeal}
          />
        </div>
      )}

      {/* 4. Deal Pipeline Progress - Full timeline with all phases */}
      <DealPipelineProgress
        currentPhase={currentPhase}
        milestones={milestones}
        healthPercentage={dataRoomHealth.healthPercentage}
        onJumpToTab={onTabChange}
        onViewHistory={() => onTabChange('activity')}
      />

      {/* Two Column Layout for remaining cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* 5. Data Room Status */}
          <DataRoomStatusCard
            healthPercentage={dataRoomHealth.healthPercentage}
            totalFolders={folders.length}
            foldersWithDocuments={folderStats.foldersWithDocuments}
            totalDocuments={folderStats.totalDocuments}
            pendingReview={folderStats.pendingReview}
            folders={folderStats.folders}
            onGoToDataRoom={() => onTabChange('data-room')}
          />

          {/* 6. Key Information */}
          <KeyInformationCard
            deal={deal}
            onEditDetails={() => onTabChange('settings')}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* 7. Team & Collaboration */}
          <TeamCollaborationCard
            teamMembers={teamMembers}
            ownerName={user?.email?.split('@')[0]}
            onAddTeamMember={() => onTabChange('team')}
            onManageTeam={() => onTabChange('team')}
          />

          {/* 8. Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
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
                <ArrowRight className="ml-1 h-4 w-4" />
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

          {/* 9. Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3"
                onClick={() => onTabChange('data-room')}
              >
                <Upload className="h-4 w-4 mr-2" />
                <span className="text-left">
                  <span className="block font-medium">Upload Docs</span>
                  <span className="block text-xs text-muted-foreground">Add to data room</span>
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3"
                onClick={() => onTabChange('requests')}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-left">
                  <span className="block font-medium">Add Request</span>
                  <span className="block text-xs text-muted-foreground">New DD item</span>
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3"
                onClick={() => onTabChange('team')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="text-left">
                  <span className="block font-medium">Invite Team</span>
                  <span className="block text-xs text-muted-foreground">Add collaborators</span>
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3"
              >
                <FileDown className="h-4 w-4 mr-2" />
                <span className="text-left">
                  <span className="block font-medium">Export</span>
                  <span className="block text-xs text-muted-foreground">Generate report</span>
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
