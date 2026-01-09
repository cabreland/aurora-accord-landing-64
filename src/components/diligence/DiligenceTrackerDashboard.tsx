import React, { useState, useMemo } from 'react';
import { Plus, Settings, Building2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDealsWithDiligence, useDiligenceRequests, useDiligenceCategories } from '@/hooks/useDiligenceTracker';
import CreateTrackerDialog from './CreateTrackerDialog';
import ExecutiveSummary from './dashboard/ExecutiveSummary';
import UrgentItemsPanel from './dashboard/UrgentItemsPanel';
import EnhancedTrackerCard from './dashboard/EnhancedTrackerCard';
import TrackerTableView from './dashboard/TrackerTableView';
import TrackerKanbanView from './dashboard/TrackerKanbanView';
import AnalyticsWidgets from './dashboard/AnalyticsWidgets';
import AdvancedFilters, { ViewMode } from './dashboard/AdvancedFilters';
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
  }, [dealsWithCategories, searchQuery, progressFilter, hasOverdue]);
  
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
          <div className="text-center py-12 text-gray-500">Loading trackers...</div>
        ) : filteredDeals.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trackers found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || activeFilterCount > 0 
                  ? 'Try adjusting your filters or search query'
                  : 'Create a diligence tracker to start managing due diligence'}
              </p>
              {!searchQuery && activeFilterCount === 0 && (
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tracker
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      
      {/* Analytics Widgets */}
      {deals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Insights</h2>
          <AnalyticsWidgets {...analyticsData} />
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
