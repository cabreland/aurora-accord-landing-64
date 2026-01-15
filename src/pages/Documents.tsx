import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentLibrary } from '@/hooks/useDocumentLibrary';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { 
  DocumentStatCard, 
  DocumentCard, 
  DealDocumentCard,
  DocumentLibraryEmpty,
  QuickFilters
} from '@/components/documents/library';
import DocumentCategoriesView from '@/components/documents/DocumentCategoriesView';
import { 
  FileText, 
  Folder, 
  HardDrive, 
  RefreshCw,
  ArrowRight,
  Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const Documents = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dealParam = searchParams.get('deal');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    stats,
    recentDocs,
    dealsWithDocs,
    allDeals,
    isLoading,
    refresh,
    searchQuery,
    setSearchQuery,
    selectedDealId,
    setSelectedDealId,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    clearFilters
  } = useDocumentLibrary();

  // Sync URL param with selected deal
  React.useEffect(() => {
    if (dealParam) {
      setSelectedDealId(dealParam);
    }
  }, [dealParam, setSelectedDealId]);

  if (!user) {
    return <div className="p-6">Please sign in to access documents.</div>;
  }

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Document Library' },
  ];

  // Show deal-specific view if a deal is selected
  const showDealView = selectedDealId !== 'all';
  const selectedDeal = allDeals.find(d => d.id === selectedDealId);

  return (
    <AdminDashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Document Library</h1>
            <p className="text-muted-foreground mt-1">
              Centralized document repository for all your deals
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <DocumentStatCard
                icon={FileText}
                label="Total Documents"
                value={stats.totalDocs}
              />
              <DocumentStatCard
                icon={Folder}
                label="Deals with Documents"
                value={stats.activeDeals}
              />
              <DocumentStatCard
                icon={HardDrive}
                label="Total Storage"
                value={`${stats.totalSizeGB} GB`}
              />
            </>
          )}
        </div>

        {/* Quick Filters */}
        <QuickFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDealId={selectedDealId}
          onDealChange={(id) => {
            setSelectedDealId(id);
            if (id === 'all') {
              navigate('/documents');
            } else {
              navigate(`/documents?deal=${id}`);
            }
          }}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          deals={allDeals}
          onClearFilters={() => {
            clearFilters();
            navigate('/documents');
          }}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Deal-specific view */}
        {showDealView ? (
          <div className="space-y-6">
            {/* Deal Header */}
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                {selectedDeal?.company_name || 'Deal Documents'}
              </h2>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Filtered View
              </Badge>
            </div>
            
            <DocumentCategoriesView 
              dealId={selectedDealId}
              refreshTrigger={refreshTrigger}
              onRefresh={() => {
                setRefreshTrigger(prev => prev + 1);
                refresh();
              }}
            />
          </div>
        ) : (
          <>
            {/* Recently Added Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span>📋</span> Recently Added
                </h2>
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : recentDocs.length > 0 ? (
                <div className="space-y-3">
                  {recentDocs.map(doc => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              ) : (
                <DocumentLibraryEmpty type="recent" />
              )}
            </section>

            {/* By Deal Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span>🏢</span> By Deal
                </h2>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </div>
              ) : dealsWithDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dealsWithDocs.map(deal => (
                    <DealDocumentCard
                      key={deal.id}
                      deal={deal}
                      documentCount={deal.documentCount}
                      categories={deal.categories}
                      lastUpdated={deal.lastUpdated}
                    />
                  ))}
                </div>
              ) : (
                <DocumentLibraryEmpty type="deals" />
              )}
            </section>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Documents;
