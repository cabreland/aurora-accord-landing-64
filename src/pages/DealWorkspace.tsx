import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { resolveDealRoute } from '@/lib/data/dealRouting';
import { 
  DealWorkspaceTabs, 
  DealOverviewTab, 
  ActivityFeedTab, 
  TeamTab,
  DealTab 
} from '@/components/deal-workspace';
import { DealSettingsTab } from '@/components/deals/tabs';
import { 
  EnhancedDataRoomSidebar, 
  EnhancedDataRoomContent, 
  DataRoomMetricsBar, 
  DataRoomStatsBar, 
  DataRoomEmptyState, 
  DataRoomApprovalBar 
} from '@/components/data-room';
import { useDataRoom } from '@/hooks/useDataRoom';
import { useDiligenceRequests } from '@/hooks/useDiligenceTracker';
import { useDealTeam } from '@/hooks/useDealTeam';
import { useDealActivities } from '@/hooks/useDealActivities';
import DealDiligenceTracker from '@/components/diligence/DealDiligenceTracker';
import { cn } from '@/lib/utils';

interface Deal {
  id: string;
  title: string;
  company_name: string;
  company_id?: string | null;
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
  created_by?: string;
  // Approval workflow fields
  approval_status?: string | null;
  submitted_for_review_at?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  approval_notes?: string | null;
  revision_requested_at?: string | null;
  revision_notes?: string | null;
}

const DealWorkspace: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isAdmin, isEditor } = useUserProfile();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DealTab>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'data-room', 'requests', 'activity', 'team', 'settings'].includes(tabParam)) {
      return tabParam as DealTab;
    }
    return 'overview';
  });

  // Data Room state
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);

  // Hooks for counts
  const { data: requests = [] } = useDiligenceRequests(deal?.id);
  const { data: teamMembers = [] } = useDealTeam(deal?.id);
  const { data: activities = [] } = useDealActivities(deal?.id, 100);
  const {
    categories,
    folders,
    documents,
    templates,
    loading: dataRoomLoading,
    refresh: refreshDataRoom,
    applyTemplate,
    uploadDocument,
    deleteDocument,
    updateDocumentStatus,
  } = useDataRoom({ dealId: deal?.id });

  // Fetch deal data
  useEffect(() => {
    const fetchDeal = async () => {
      if (!dealId) return;
      
      try {
        setLoading(true);
        
        // Resolve the ID (could be company or deal ID)
        const routeInfo = await resolveDealRoute(dealId);
        const idToUse = routeInfo.dealId || dealId;
        
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('id', idToUse)
          .maybeSingle();

        if (error) throw error;
        setDeal(data as Deal);
      } catch (error) {
        console.error('Error fetching deal:', error);
        toast({
          title: 'Error',
          description: 'Failed to load deal details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId, toast]);

  // Update URL when tab changes
  const handleTabChange = (tab: DealTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    // Reset data room state when switching tabs
    if (tab !== 'data-room') {
      setSelectedFolderId(null);
      setSelectedCategoryId(null);
      setActiveMetricFilter(null);
    }
  };

  const handleBack = () => {
    const dest = (isAdmin() || isEditor()) ? '/deals' : '/investor-portal';
    navigate(dest);
  };

  const canEdit = isAdmin() || isEditor();

  // Filter documents for data room
  const filteredDocuments = React.useMemo(() => {
    let result = documents;

    if (selectedFolderId) {
      result = result.filter((doc) => doc.folder_id === selectedFolderId);
    } else if (selectedCategoryId) {
      const categoryFolderIds = folders
        .filter((f) => f.category_id === selectedCategoryId)
        .map((f) => f.id);
      result = result.filter((doc) => doc.folder_id && categoryFolderIds.includes(doc.folder_id));
    }

    if (activeMetricFilter === 'approved') {
      result = result.filter((doc) => doc.status === 'approved');
    } else if (activeMetricFilter === 'pending') {
      result = result.filter((doc) => doc.status === 'pending_review');
    }

    return result;
  }, [documents, selectedFolderId, selectedCategoryId, folders, activeMetricFilter]);

  const currentLocation = React.useMemo(() => {
    if (selectedFolderId) {
      const folder = folders.find((f) => f.id === selectedFolderId);
      return folder?.name || 'Documents';
    }
    if (selectedCategoryId) {
      const category = categories.find((c) => c.id === selectedCategoryId);
      return category?.name || 'Documents';
    }
    return 'All Documents';
  }, [selectedFolderId, selectedCategoryId, folders, categories]);

  const breadcrumbs = [
    { label: 'Deals', path: '/deals' },
    { label: deal?.company_name || 'Deal' },
    ...(activeTab !== 'overview' ? [{ label: activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }] : [])
  ];

  if (loading) {
    return (
      <AdminDashboardLayout activeTab="deals" breadcrumbs={[{ label: 'Deals', path: '/deals' }, { label: 'Loading...' }]}>
        <div className="p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!deal) {
    return (
      <AdminDashboardLayout activeTab="deals" breadcrumbs={[{ label: 'Deals', path: '/deals' }, { label: 'Not Found' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-card p-8 rounded-xl border border-border shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Deal not found</h2>
            <Button onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  const openRequestCount = requests.filter(r => r.status !== 'completed').length;

  return (
    <AdminDashboardLayout activeTab="deals" breadcrumbs={breadcrumbs}>
      {/* Deal Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{deal.company_name}</h1>
                  <Badge variant="outline" className="capitalize bg-muted/50">{deal.status}</Badge>
                  <Badge 
                    className={cn(
                      "capitalize",
                      deal.priority === 'high' && 'bg-destructive/10 text-destructive border-destructive/30',
                      deal.priority === 'medium' && 'bg-warning/10 text-warning border-warning/30',
                      deal.priority === 'low' && 'bg-success/10 text-success border-success/30',
                    )}
                    variant="outline"
                  >
                    {deal.priority}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  {deal.industry || 'Industry'} • {deal.location || 'Location'}
                </p>
              </div>
            </div>
            
            {canEdit && (
              <Button variant="outline" className="shadow-sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Deal
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <DealWorkspaceTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            hasNDAAccess={true}
            requestCount={openRequestCount}
            activityCount={activities.length}
            teamCount={teamMembers.length}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-secondary/30 min-h-[calc(100vh-280px)]">
        {activeTab === 'overview' && (
          <DealOverviewTab deal={deal} onTabChange={handleTabChange} />
        )}

        {activeTab === 'data-room' && (
          <div className="space-y-4">
            {/* Admin Approval Bar - Show for admins when under review */}
            {!dataRoomLoading && folders.length > 0 && isAdmin() && deal?.approval_status === 'under_review' && (
              <DataRoomApprovalBar
                dealId={deal.id}
                deal={deal}
                folders={folders}
                documents={documents}
                onRefresh={refreshDataRoom}
              />
            )}

            {/* Stats Bar */}
            {!dataRoomLoading && folders.length > 0 && (
              <DataRoomStatsBar
                folders={folders}
                documents={documents}
              />
            )}

            {/* Metrics Bar */}
            {!dataRoomLoading && folders.length > 0 && (
              <DataRoomMetricsBar
                folders={folders}
                documents={documents}
                loading={dataRoomLoading}
                activeFilter={activeMetricFilter}
                onFilterChange={setActiveMetricFilter}
              />
            )}
            
            {dataRoomLoading ? (
              <div className="flex gap-6">
                <Skeleton className="w-72 h-96" />
                <Skeleton className="flex-1 h-96" />
              </div>
            ) : folders.length === 0 ? (
              <DataRoomEmptyState 
                templates={templates} 
                onApplyTemplate={applyTemplate} 
              />
            ) : (
              <div className="flex gap-6">
                <EnhancedDataRoomSidebar
                  categories={categories}
                  folders={folders}
                  documents={documents}
                  selectedFolderId={selectedFolderId}
                  selectedCategoryId={selectedCategoryId}
                  onSelectFolder={(folderId, categoryId) => {
                    setSelectedFolderId(folderId);
                    if (categoryId) setSelectedCategoryId(categoryId);
                    setActiveMetricFilter(null);
                  }}
                  onSelectCategory={(categoryId) => {
                    setSelectedCategoryId(categoryId);
                    setSelectedFolderId(null);
                    setActiveMetricFilter(null);
                  }}
                  deal={deal ? { id: deal.id } : undefined}
                  enableFolderManagement={isAdmin() || isEditor()}
                />
                <EnhancedDataRoomContent
                  documents={filteredDocuments}
                  folders={folders}
                  categories={categories}
                  selectedFolderId={selectedFolderId}
                  selectedCategoryId={selectedCategoryId}
                  currentLocation={currentLocation}
                  onUpload={(file) => uploadDocument(file, selectedFolderId)}
                  onDelete={deleteDocument}
                  onUpdateStatus={updateDocumentStatus}
                  onNavigateHome={() => {
                    setSelectedFolderId(null);
                    setSelectedCategoryId(null);
                    setActiveMetricFilter(null);
                  }}
                  onNavigateCategory={(categoryId) => {
                    setSelectedCategoryId(categoryId);
                    setSelectedFolderId(null);
                  }}
                  // Submit for review props
                  dealId={deal.id}
                  approvalStatus={deal.approval_status}
                  isOwner={deal.created_by === profile?.user_id}
                  onRefresh={async () => {
                    // Refetch deal data
                    const { data } = await supabase
                      .from('deals')
                      .select('*')
                      .eq('id', deal.id)
                      .maybeSingle();
                    if (data) setDeal(data as Deal);
                    refreshDataRoom();
                  }}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && deal && (
          <DealDiligenceTracker />
        )}

        {activeTab === 'activity' && (
          <ActivityFeedTab dealId={deal.id} />
        )}

        {activeTab === 'team' && (
          <TeamTab dealId={deal.id} />
        )}

        {activeTab === 'settings' && (
          <DealSettingsTab />
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default DealWorkspace;
