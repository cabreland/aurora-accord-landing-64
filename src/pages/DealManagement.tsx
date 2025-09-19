
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyDeals } from '@/hooks/useMyDeals';
import { useUserProfile } from '@/hooks/useUserProfile';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { DealMetricsBar } from '@/components/deals/DealMetricsBar';
import { DealFilters } from '@/components/deals/DealFilters';
import { DealCardsView } from '@/components/deals/DealCardsView';
import { DealListView } from '@/components/deals/DealListView';
import { DealKanbanView } from '@/components/deals/DealKanbanView';
import { DealDetailPanel } from '@/components/deals/DealDetailPanel';
import { DealWizard } from '@/components/deals/wizard/DealWizard';

type ViewType = 'cards' | 'list' | 'kanban';

const DealManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useUserProfile();
  
  const currentView = (searchParams.get('view') as ViewType) || 'cards';
  const selectedDealId = searchParams.get('deal') || null;
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    deals, 
    loading, 
    filters, 
    updateFilters, 
    clearFilters, 
    refresh, 
    totalDeals, 
    filteredCount 
  } = useMyDeals();

  useEffect(() => {
    updateFilters({ search: searchQuery });
  }, [searchQuery]); // Remove updateFilters from deps to prevent infinite re-render

  const handleViewChange = (view: ViewType) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', view);
    if (selectedDealId) {
      newParams.delete('deal');
    }
    setSearchParams(newParams);
  };

  const handleDealSelect = (dealId: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (dealId) {
      newParams.set('deal', dealId);
    } else {
      newParams.delete('deal');
    }
    setSearchParams(newParams);
  };

  const canCreateDeals = profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.role === 'editor';

  const renderMainContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <DealListView 
            deals={deals} 
            loading={loading} 
            onDealSelect={handleDealSelect}
            selectedDealId={selectedDealId}
          />
        );
      case 'kanban':
        return (
          <DealKanbanView 
            deals={deals} 
            loading={loading} 
            onDealSelect={handleDealSelect}
            selectedDealId={selectedDealId}
            onCreateDeal={(status) => {
              // Open creation wizard with default status
              setShowCreateDialog(true);
            }}
          />
        );
      default:
        return (
          <DealCardsView 
            deals={deals} 
            loading={loading} 
            onDealSelect={handleDealSelect}
            selectedDealId={selectedDealId}
          />
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-background">
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${selectedDealId ? 'mr-96' : ''} transition-all duration-300`}>
          {/* Header */}
          <div className="border-b border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Deal Management</h1>
                <p className="text-muted-foreground">
                  Manage your investment opportunities and pipeline
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {canCreateDeals && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Deal
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Metrics Bar */}
            <DealMetricsBar 
              totalDeals={totalDeals}
              filteredCount={filteredCount}
              deals={deals}
            />

            {/* Search and Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-muted' : ''}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              {/* View Switcher */}
              <Tabs value={currentView} onValueChange={handleViewChange}>
                <TabsList>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4">
                <DealFilters 
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {renderMainContent()}
          </div>
        </div>

        {/* Deal Detail Panel */}
        {selectedDealId && (
          <DealDetailPanel 
            dealId={selectedDealId}
            onClose={() => handleDealSelect(null)}
            onDealUpdated={refresh}
          />
        )}

        {/* Deal Creation Wizard */}
        <DealWizard 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onDealCreated={refresh}
        />
      </div>
    </DashboardLayout>
  );
};

export default DealManagement;
