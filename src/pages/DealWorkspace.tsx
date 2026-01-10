import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { getDashboardRoute } from '@/lib/auth-utils';
import { resolveDealRoute } from '@/lib/data/dealRouting';
import { 
  DealWorkspaceTabs, 
  DealOverviewTab, 
  ActivityFeedTab, 
  TeamTab,
  DealTab 
} from '@/components/deal-workspace';
import { DataRoomSidebar } from '@/components/data-room/DataRoomSidebar';
import { DataRoomContent } from '@/components/data-room/DataRoomContent';
import { DataRoomMetricsBar } from '@/components/data-room/DataRoomMetricsBar';
import { DataRoomEmptyState } from '@/components/data-room/DataRoomEmptyState';
import { useDataRoom } from '@/hooks/useDataRoom';
import { useDiligenceRequests, useDealsWithDiligence } from '@/hooks/useDiligenceTracker';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Deal not found</h2>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deals
          </Button>
        </div>
      </div>
    );
  }

  const openRequestCount = requests.filter(r => r.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <Breadcrumbs 
            dealName={deal.company_name} 
            currentTab={activeTab !== 'overview' ? activeTab : undefined} 
          />
          
          {/* Deal Header */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{deal.company_name}</h1>
                  <Badge variant="outline" className="capitalize">{deal.status}</Badge>
                  <Badge 
                    className={cn(
                      deal.priority === 'high' && 'bg-red-100 text-red-800',
                      deal.priority === 'medium' && 'bg-amber-100 text-amber-800',
                      deal.priority === 'low' && 'bg-green-100 text-green-800',
                    )}
                  >
                    {deal.priority}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {deal.industry || 'Industry'} • {deal.location || 'Location'}
                </p>
              </div>
            </div>
            
            {canEdit && (
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Deal
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-6">
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
      <div className="container mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <DealOverviewTab deal={deal} onTabChange={handleTabChange} />
        )}

        {activeTab === 'data-room' && (
          <div className="space-y-6">
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
                <Skeleton className="w-80 h-96" />
                <Skeleton className="flex-1 h-96" />
              </div>
            ) : folders.length === 0 ? (
              <DataRoomEmptyState 
                templates={templates} 
                onApplyTemplate={applyTemplate} 
              />
            ) : (
              <div className="flex gap-6">
                <DataRoomSidebar
                  categories={categories}
                  folders={folders}
                  documents={documents}
                  selectedFolderId={selectedFolderId}
                  selectedCategoryId={selectedCategoryId}
                  onSelectFolder={(folderId, categoryId) => {
                    setSelectedFolderId(folderId);
                    if (categoryId) setSelectedCategoryId(categoryId);
                  }}
                  onSelectCategory={(categoryId) => {
                    setSelectedCategoryId(categoryId);
                    setSelectedFolderId(null);
                  }}
                />
                <DataRoomContent
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
                  }}
                  onNavigateCategory={(categoryId) => {
                    setSelectedCategoryId(categoryId);
                    setSelectedFolderId(null);
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Deal Settings</h3>
            <p className="text-muted-foreground">
              Deal settings and configuration coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealWorkspace;
