import React, { useState, useMemo } from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { useFinancingApplications, useLenders, FinancingStage } from '@/hooks/useFinancing';
import { FinancingPipelineOverview } from '@/components/financing/FinancingPipelineOverview';
import { FinancingAttentionRequired } from '@/components/financing/FinancingAttentionRequired';
import { FinancingApplicationsByStage } from '@/components/financing/FinancingApplicationsByStage';
import { LenderPerformanceMetrics } from '@/components/financing/LenderPerformanceMetrics';
import { FinancingFilters } from '@/components/financing/FinancingFilters';
import { AddDealToFinancingDialog } from '@/components/financing/AddDealToFinancingDialog';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FinancingTracker = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    lenderId: ''
  });
  
  const { data: applications = [], isLoading: appsLoading, refetch } = useFinancingApplications();
  const { data: lenders = [], isLoading: lendersLoading } = useLenders();
  
  const isLoading = appsLoading || lendersLoading;
  
  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDeal = app.deal?.company_name?.toLowerCase().includes(searchLower);
        const matchesLender = app.lender?.name?.toLowerCase().includes(searchLower);
        const matchesNumber = app.application_number?.toLowerCase().includes(searchLower);
        if (!matchesDeal && !matchesLender && !matchesNumber) return false;
      }
      
      // Stage filter
      if (filters.stage && filters.stage !== 'all' && app.stage !== filters.stage) {
        return false;
      }
      
      // Lender filter
      if (filters.lenderId && filters.lenderId !== 'all' && app.lender_id !== filters.lenderId) {
        return false;
      }
      
      return true;
    });
  }, [applications, filters]);
  
  // Get unique deals for filter
  const deals = useMemo(() => {
    const uniqueDeals = new Map();
    applications.forEach(app => {
      if (app.deal && !uniqueDeals.has(app.deal.id)) {
        uniqueDeals.set(app.deal.id, app.deal);
      }
    });
    return Array.from(uniqueDeals.values());
  }, [applications]);

  const breadcrumbs = [{ label: 'Financing' }];

  return (
    <AdminDashboardLayout activeTab="financing" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-[#D4AF37]" />
              Financing Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor loan applications across all deals
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-[#D4AF37] hover:bg-[#B4941F] text-black"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Deal
            </Button>
          </div>
          
          <AddDealToFinancingDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-24 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 rounded-xl" />
              </div>
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Pipeline Overview */}
            <FinancingPipelineOverview applications={applications} />
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border rounded-xl p-4">
              <FinancingFilters
                filters={filters}
                onFiltersChange={setFilters}
                lenders={lenders}
                deals={deals}
              />
              <div className="text-sm text-muted-foreground">
                {filteredApplications.length} of {applications.length} applications
              </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Applications by Stage - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <FinancingApplicationsByStage applications={filteredApplications} />
              </div>
              
              {/* Sidebar - 1/3 width */}
              <div className="space-y-6">
                <FinancingAttentionRequired applications={applications} />
                <LenderPerformanceMetrics applications={applications} lenders={lenders} />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default FinancingTracker;
