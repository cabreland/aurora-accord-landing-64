import React, { useState, useMemo } from 'react';
import { Plus, Settings, Building2, Search, RefreshCw, Loader2, Briefcase, FileText, CheckCircle, AlertTriangle, X, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDealsWithDiligence, useDiligenceRequests, useDiligenceCategories } from '@/hooks/useDiligenceTracker';
import { useDebounce } from '@/hooks/useDebounce';
import CreateTrackerDialog from './CreateTrackerDialog';
import ClickableMetricCard from './dashboard/ClickableMetricCard';

import PriorityActionsPanel from './dashboard/PriorityActionsPanel';
import EnhancedTrackerCard from './dashboard/EnhancedTrackerCard';
import TrackerTableView from './dashboard/TrackerTableView';
import TrackerKanbanView from './dashboard/TrackerKanbanView';
import TrackerCardSkeleton from './dashboard/TrackerCardSkeleton';
import AnalyticsWidgets from './dashboard/AnalyticsWidgets';
import AdvancedFilters, { ViewMode } from './dashboard/AdvancedFilters';
import ExportDropdown from './dashboard/ExportDropdown';
import DiligenceActivityFeed from './dashboard/DiligenceActivityFeed';
import DeadlinesModal from './dashboard/DeadlinesModal';
import ReportsModal from './dashboard/ReportsModal';
import { isPast, isToday, differenceInDays } from 'date-fns';

const DiligenceTrackerDashboard: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Default to table/list view
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [hasOverdue, setHasOverdue] = useState(false);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [assignedToMe, setAssignedToMe] = useState(false);
  
  // Active metric filter (for clickable cards)
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);
  
  // Modal states
  const [showDeadlinesModal, setShowDeadlinesModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  
  const { data: deals = [], isLoading: dealsLoading } = useDealsWithDiligence();
  const { data: allRequests = [] } = useDiligenceRequests();
  const { data: categories = [] } = useDiligenceCategories();
  
  // Debounce search query for performance (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const openRequests = allRequests.filter(r => r.status !== 'completed').length;
    const completedRequests = allRequests.filter(r => r.status === 'completed').length;
    const overdueRequests = allRequests.filter(r => {
      if (r.status === 'completed' || !r.due_date) return false;
      const dueDate = new Date(r.due_date);
      return isPast(dueDate) && !isToday(dueDate);
    }).length;
    
    // Calculate upcoming deadlines (next 7 days, excluding overdue)
    const upcomingDeadlines = allRequests.filter(r => {
      if (r.status === 'completed' || !r.due_date) return false;
      const dueDate = new Date(r.due_date);
      const daysUntil = differenceInDays(dueDate, new Date());
      return daysUntil >= 0 && daysUntil <= 7;
    }).length;
    
    return {
      activeDeals: deals.length,
      openRequests,
      completedRequests, // Now "Satisfied"
      overdueRequests,
      upcomingDeadlines,
      totalRequests: allRequests.length,
      completionRate: allRequests.length > 0 
        ? Math.round((completedRequests / allRequests.length) * 100) 
        : 0
    };
  }, [allRequests, deals]);
  
  // Get urgent items (overdue + due soon)
  const urgentItems = useMemo(() => {
    const now = new Date();
    return allRequests
      .filter(r => {
        if (r.status === 'completed' || !r.due_date) return false;
        const dueDate = new Date(r.due_date);
        const daysUntil = differenceInDays(dueDate, now);
        return daysUntil <= 3; // Overdue or due within 3 days
      })
      .map(r => {
        const deal = deals.find(d => d.id === r.deal_id);
        const category = categories.find(c => c.id === r.category_id);
        return {
          id: r.id,
          deal_id: r.deal_id,
          title: r.title,
          company_name: deal?.company_name || 'Unknown',
          category_name: category?.name || 'General',
          due_date: r.due_date!,
          priority: r.priority,
          status: r.status
        };
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [allRequests, deals, categories]);
  
  // Calculate category progress for each deal
  const dealsWithCategories = useMemo(() => {
    return deals.map(deal => {
      const dealRequests = allRequests.filter(r => r.deal_id === deal.id);
      const categoryProgress = categories.map(cat => {
        const catRequests = dealRequests.filter(r => r.category_id === cat.id);
        const completed = catRequests.filter(r => r.status === 'completed').length;
        const overdue = catRequests.filter(r => {
          if (r.status === 'completed' || !r.due_date) return false;
          return isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date));
        }).length;
        return {
          name: cat.name,
          completed,
          total: catRequests.length,
          overdue
        };
      }).filter(c => c.total > 0);
      
      const overdueCount = dealRequests.filter(r => {
        if (r.status === 'completed' || !r.due_date) return false;
        return isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date));
      }).length;
      
      return {
        ...deal,
        categories: categoryProgress,
        overdueCount
      };
    });
  }, [deals, allRequests, categories]);
  
  // Helper to calculate deal status based on requests
  const getDealStatus = (deal: typeof dealsWithCategories[0]) => {
    const dealRequests = allRequests.filter(r => r.deal_id === deal.id);
    if (dealRequests.length === 0) return 'active';
    
    const allCompleted = dealRequests.every(r => r.status === 'completed');
    if (allCompleted) return 'completed';
    
    const hasBlocked = dealRequests.some(r => r.status === 'blocked');
    if (hasBlocked) return 'blocked';
    
    const hasOverdueItems = deal.overdueCount > 0;
    const hasHighRisk = dealRequests.some(r => (r.risk_score || 0) >= 70);
    if (hasOverdueItems || hasHighRisk) return 'at_risk';
    
    return 'active';
  };

  // Helper to get deal risk level
  const getDealRiskLevel = (deal: typeof dealsWithCategories[0]) => {
    const dealRequests = allRequests.filter(r => r.deal_id === deal.id);
    if (dealRequests.length === 0) return 'low';
    
    const avgRisk = dealRequests.reduce((sum, r) => sum + (r.risk_score || 0), 0) / dealRequests.length;
    if (avgRisk >= 70) return 'high';
    if (avgRisk >= 40) return 'medium';
    return 'low';
  };

  // Helper to get deal stage (from requests or default)
  const getDealStage = (deal: typeof dealsWithCategories[0]) => {
    const dealRequests = allRequests.filter(r => r.deal_id === deal.id);
    if (dealRequests.length === 0) return 'early';
    
    // Get the most common stage from requests
    const stages = dealRequests.map(r => r.stage || 'early');
    const stageCounts = stages.reduce((acc, stage) => {
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedStages = Object.entries(stageCounts).sort((a, b) => (b[1] as number) - (a[1] as number));
    return sortedStages[0]?.[0] || 'early';
  };

  // Metric click handlers
  const handleMetricClick = (metricType: string) => {
    if (activeMetricFilter === metricType) {
      // Clear filter if clicking same metric
      setActiveMetricFilter(null);
      resetFilters();
    } else {
      setActiveMetricFilter(metricType);
      
      // Apply appropriate filter based on metric type
      switch (metricType) {
        case 'active':
          setStatusFilter('all');
          setHasOverdue(false);
          break;
        case 'open':
          setStatusFilter('active');
          setHasOverdue(false);
          break;
        case 'satisfied':
          setStatusFilter('completed');
          setHasOverdue(false);
          break;
        case 'overdue':
          setHasOverdue(true);
          setStatusFilter('all');
          break;
      }
    }
  };


  // Apply filters
  const filteredDeals = useMemo(() => {
    return dealsWithCategories.filter(deal => {
      // Search filter (using debounced query)
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        if (!deal.company_name.toLowerCase().includes(query) && 
            !deal.title.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const dealStatus = getDealStatus(deal);
        if (dealStatus !== statusFilter) {
          return false;
        }
      }
      
      // Stage filter
      if (stageFilter !== 'all') {
        const dealStage = getDealStage(deal);
        if (dealStage !== stageFilter) {
          return false;
        }
      }
      
      // Risk filter
      if (riskFilter !== 'all') {
        const dealRisk = getDealRiskLevel(deal);
        if (dealRisk !== riskFilter) {
          return false;
        }
      }
      
      // Progress filter
      if (progressFilter !== 'all') {
        const [min, max] = progressFilter.split('-').map(Number);
        if (deal.progress_percentage < min || deal.progress_percentage > max) {
          return false;
        }
      }
      
      // Overdue filter
      if (hasOverdue && deal.overdueCount === 0) {
        return false;
      }
      
      return true;
    });
  }, [dealsWithCategories, debouncedSearchQuery, statusFilter, stageFilter, riskFilter, progressFilter, hasOverdue, allRequests]);
  
  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (stageFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (ownerFilter !== 'all') count++;
    if (progressFilter !== 'all') count++;
    if (riskFilter !== 'all') count++;
    if (hasOverdue) count++;
    if (highPriorityOnly) count++;
    if (assignedToMe) count++;
    return count;
  }, [stageFilter, statusFilter, ownerFilter, progressFilter, riskFilter, hasOverdue, highPriorityOnly, assignedToMe]);
  
  const resetFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    setStatusFilter('all');
    setOwnerFilter('all');
    setProgressFilter('all');
    setRiskFilter('all');
    setHasOverdue(false);
    setHighPriorityOnly(false);
    setAssignedToMe(false);
    setActiveMetricFilter(null);
  };
  
  // Selection handlers
  const handleSelectDeal = (dealId: string, selected: boolean) => {
    if (selected) {
      setSelectedDeals([...selectedDeals, dealId]);
    } else {
      setSelectedDeals(selectedDeals.filter(id => id !== dealId));
    }
  };
  
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDeals(filteredDeals.map(d => d.id));
    } else {
      setSelectedDeals([]);
    }
  };
  
  // Real analytics data derived from actual requests
  const analyticsData = {
    completionTrend: [] as number[], // Would require historical tracking
    teamStats: [] as { name: string; initials: string; completed: number; assigned: number }[], // Would require team assignments
    bottlenecks: [] as { category: string; pending: number; status: 'critical' | 'warning' | 'good' }[], // Would require category analysis
    deadlines: [
      { label: 'Overdue', count: stats.overdueRequests, status: 'overdue' as const },
      { label: 'Today', count: allRequests.filter(r => r.due_date && isToday(new Date(r.due_date))).length, status: 'today' as const },
      { label: 'This Week', count: allRequests.filter(r => {
        if (!r.due_date || r.status === 'completed') return false;
        const due = new Date(r.due_date);
        return !isPast(due) && differenceInDays(due, new Date()) <= 7;
      }).length, status: 'week' as const },
      { label: 'Next Week', count: allRequests.filter(r => {
        if (!r.due_date || r.status === 'completed') return false;
        const due = new Date(r.due_date);
        const days = differenceInDays(due, new Date());
        return days > 7 && days <= 14;
      }).length, status: 'next' as const },
    ],
    avgCompletionDays: 0
  };

  return (
    <div className="space-y-6">
      {/* Header - Simplified */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Due Diligence Workstream</h1>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown 
            deals={filteredDeals}
            requests={allRequests}
            categories={categories}
          />
          <Button 
            variant="outline" 
            size="sm"
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>
      
      {/* Clickable Metrics - 6 cards in 2 rows */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <ClickableMetricCard
          icon={Briefcase}
          value={stats.activeDeals}
          label="Active Deals"
          description="Companies in DD"
          color="blue"
          onClick={() => handleMetricClick('active')}
          isActive={activeMetricFilter === 'active'}
        />
        <ClickableMetricCard
          icon={FileText}
          value={stats.openRequests}
          label="Open Requests"
          description="Pending information"
          color="amber"
          onClick={() => handleMetricClick('open')}
          isActive={activeMetricFilter === 'open'}
        />
        <ClickableMetricCard
          icon={CheckCircle}
          value={stats.completedRequests}
          label="Satisfied"
          description="Requests fulfilled"
          color="green"
          onClick={() => handleMetricClick('satisfied')}
          isActive={activeMetricFilter === 'satisfied'}
        />
        <ClickableMetricCard
          icon={AlertTriangle}
          value={stats.overdueRequests}
          label="Overdue"
          description="Past due date"
          color="red"
          onClick={() => handleMetricClick('overdue')}
          isActive={activeMetricFilter === 'overdue'}
        />
        <ClickableMetricCard
          icon={Calendar}
          value={stats.upcomingDeadlines}
          label="Deadlines"
          description="Due this week"
          color="amber"
          onClick={() => setShowDeadlinesModal(true)}
          isActive={false}
        />
        <ClickableMetricCard
          icon={BarChart3}
          value={stats.completionRate}
          label="Stats"
          description="View reports"
          color="blue"
          onClick={() => setShowReportsModal(true)}
          isActive={false}
        />
      </div>

      {/* Clear Filter Button - Show when metric filter is active */}
      {activeMetricFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Filtering by: <span className="font-medium capitalize">{activeMetricFilter}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveMetricFilter(null);
              resetFilters();
            }}
            className="h-7 px-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
      
      
      {/* Priority Actions - Actionable urgent items panel */}
      {urgentItems.length > 0 && (
        <PriorityActionsPanel 
          items={urgentItems} 
          totalCount={urgentItems.length} 
        />
      )}
      
      {/* Advanced Filters */}
      <AdvancedFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
        progressFilter={progressFilter}
        onProgressFilterChange={setProgressFilter}
        riskFilter={riskFilter}
        onRiskFilterChange={setRiskFilter}
        hasOverdue={hasOverdue}
        onHasOverdueChange={setHasOverdue}
        highPriorityOnly={highPriorityOnly}
        onHighPriorityOnlyChange={setHighPriorityOnly}
        assignedToMe={assignedToMe}
        onAssignedToMeChange={setAssignedToMe}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFilterCount={activeFilterCount}
        onResetFilters={resetFilters}
      />
      
      {/* Bulk Actions Bar - Only show for card view */}
      {viewMode === 'cards' && selectedDeals.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            {selectedDeals.length} deal{selectedDeals.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              Assign Team
            </Button>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              Change Stage
            </Button>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              Export Reports
            </Button>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              Archive
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-800"
              onClick={() => setSelectedDeals([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Deals View */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Active Deals ({filteredDeals.length})
          </h2>
        </div>
        
        {dealsLoading ? (
          /* Loading State with Skeleton Cards */
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-gray-600">Loading deals...</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TrackerCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : filteredDeals.length === 0 && (debouncedSearchQuery || activeFilterCount > 0) ? (
          /* No Results from Filters */
          <Card className="bg-white border-gray-200 border-dashed">
            <CardContent className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals match your filters</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or removing some filters to see more results
              </p>
              <Button 
                variant="outline"
                onClick={resetFilters}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : filteredDeals.length === 0 ? (
          /* Empty State - No Deals Yet */
          <Card className="bg-white border-gray-200 border-dashed">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deals in Due Diligence</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Add your first deal to start managing due diligence workflows
              </p>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Deal
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                Templates available: SaaS, E-commerce, Digital Agency, and more
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((deal) => (
              <EnhancedTrackerCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : viewMode === 'table' ? (
          <TrackerTableView 
            deals={filteredDeals}
            selectedDeals={selectedDeals}
            onSelectDeal={handleSelectDeal}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <TrackerKanbanView 
            deals={filteredDeals}
            onCreateTracker={() => setCreateDialogOpen(true)}
            onStageChange={(dealId, newStage) => {
              // In a real app, this would update the database
              console.log('Stage change:', dealId, newStage);
            }}
          />
        )}
      </div>
      
      {/* Analytics Widgets & Activity Feed */}
      {deals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-4">
              <AnalyticsWidgets {...analyticsData} />
            </div>
            <div className="lg:col-span-1">
              <DiligenceActivityFeed onViewAll={() => console.log('View all activity')} />
            </div>
          </div>
        </div>
      )}
      
      <CreateTrackerDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      {/* Deadlines Modal */}
      <DeadlinesModal
        open={showDeadlinesModal}
        onOpenChange={setShowDeadlinesModal}
        items={urgentItems}
      />
      
      {/* Reports Modal */}
      <ReportsModal
        open={showReportsModal}
        onOpenChange={setShowReportsModal}
        completionTrend={analyticsData.completionTrend}
        teamStats={analyticsData.teamStats}
        avgCompletionDays={analyticsData.avgCompletionDays}
        completionRate={stats.completionRate}
        totalCompleted={stats.completedRequests}
        totalOpen={stats.openRequests}
      />
    </div>
  );
};

export default DiligenceTrackerDashboard;
