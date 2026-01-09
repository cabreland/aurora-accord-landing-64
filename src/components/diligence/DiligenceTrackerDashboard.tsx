import React, { useState, useMemo } from 'react';
import { Plus, Settings, Building2, BarChart3, ClipboardList, Search, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDealsWithDiligence, useDiligenceRequests, useDiligenceCategories } from '@/hooks/useDiligenceTracker';
import CreateTrackerDialog from './CreateTrackerDialog';
import ExecutiveSummary from './dashboard/ExecutiveSummary';
import UrgentItemsPanel from './dashboard/UrgentItemsPanel';
import EnhancedTrackerCard from './dashboard/EnhancedTrackerCard';
import TrackerTableView from './dashboard/TrackerTableView';
import TrackerKanbanView from './dashboard/TrackerKanbanView';
import TrackerCardSkeleton from './dashboard/TrackerCardSkeleton';
import AnalyticsWidgets from './dashboard/AnalyticsWidgets';
import AdvancedFilters, { ViewMode } from './dashboard/AdvancedFilters';
import ExportDropdown from './dashboard/ExportDropdown';
import DiligenceActivityFeed from './dashboard/DiligenceActivityFeed';
import { isPast, isToday, differenceInDays, addDays } from 'date-fns';

const DiligenceTrackerDashboard: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
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
  
  const { data: deals = [], isLoading: dealsLoading } = useDealsWithDiligence();
  const { data: allRequests = [] } = useDiligenceRequests();
  const { data: categories = [] } = useDiligenceCategories();
  
  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const now = new Date();
    const openRequests = allRequests.filter(r => r.status !== 'completed').length;
    const completedRequests = allRequests.filter(r => r.status === 'completed').length;
    const overdueRequests = allRequests.filter(r => {
      if (r.status === 'completed' || !r.due_date) return false;
      const dueDate = new Date(r.due_date);
      return isPast(dueDate) && !isToday(dueDate);
    }).length;
    
    return {
      activeTrackers: deals.length,
      openRequests,
      completedRequests,
      overdueRequests,
      totalRequests: allRequests.length,
      completionRate: allRequests.length > 0 
        ? Math.round((completedRequests / allRequests.length) * 100) 
        : 0,
      weeklyProgress: 12 // Mock - would need historical data
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

  // Apply filters
  const filteredDeals = useMemo(() => {
    return dealsWithCategories.filter(deal => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
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
  }, [dealsWithCategories, searchQuery, statusFilter, stageFilter, riskFilter, progressFilter, hasOverdue, allRequests]);
  
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
  
  // Mock analytics data
  const analyticsData = {
    completionTrend: [45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82, stats.completionRate],
    teamStats: [
      { name: 'Sarah Adams', initials: 'SA', completed: 12, assigned: 18 },
      { name: 'Mike Kim', initials: 'MK', completed: 8, assigned: 14 },
      { name: 'Hannah Jones', initials: 'HJ', completed: 6, assigned: 10 },
    ],
    bottlenecks: [
      { category: 'Financial docs', pending: 8, status: 'critical' as const },
      { category: 'Legal review', pending: 5, status: 'warning' as const },
      { category: 'Operations', pending: 2, status: 'good' as const },
    ],
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
    avgCompletionDays: 5
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diligence Tracker</h1>
          <p className="text-gray-500 mt-1">Manage due diligence workflows across all deals</p>
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
            New Tracker
          </Button>
        </div>
      </div>
      
      {/* Executive Summary */}
      <ExecutiveSummary stats={stats} />
      
      {/* Urgent Items */}
      <UrgentItemsPanel 
        items={urgentItems} 
        totalCount={urgentItems.length} 
      />
      
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
            {selectedDeals.length} tracker{selectedDeals.length > 1 ? 's' : ''} selected
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
            Active Trackers ({filteredDeals.length})
          </h2>
        </div>
        
        {dealsLoading ? (
          /* Loading State with Skeleton Cards */
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-gray-600">Loading trackers...</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TrackerCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : filteredDeals.length === 0 && (searchQuery || activeFilterCount > 0) ? (
          /* No Results from Filters */
          <Card className="bg-white border-gray-200 border-dashed">
            <CardContent className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trackers match your filters</h3>
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
          /* Empty State - No Trackers Yet */
          <Card className="bg-white border-gray-200 border-dashed">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Diligence Trackers Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first tracker to start managing due diligence workflows for your M&A deals
              </p>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Tracker
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
    </div>
  );
};

export default DiligenceTrackerDashboard;
