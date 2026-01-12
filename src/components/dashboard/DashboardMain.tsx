import React from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { useMissionControl } from '@/hooks/useMissionControl';
import { HeroStats } from './widgets/HeroStats';
import { PriorityActionsSection } from './widgets/PriorityActionsSection';
import { EnhancedDealsTable } from './widgets/EnhancedDealsTable';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardMain = () => {
  const {
    loading,
    pipelineHealth,
    dealHealthData,
    dealsRequiringAction,
    thisWeeksClosings,
    recentActivities,
    totalPipelineValue,
    refresh
  } = useMissionControl();

  return (
    <AdminDashboardLayout activeTab="dashboard">
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                Mission Control
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor deal health, track urgent items, and manage your M&A pipeline
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              disabled={loading}
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Hero Stats - 4 Cards */}
          <HeroStats 
            pipelineHealth={pipelineHealth}
            dealsRequiringAction={dealsRequiringAction}
            thisWeeksClosings={thisWeeksClosings}
            totalPipelineValue={totalPipelineValue}
            recentActivities={recentActivities}
            loading={loading}
          />

          {/* Priority Actions + Quick Stats */}
          <PriorityActionsSection 
            dealsRequiringAction={dealsRequiringAction}
            loading={loading}
          />

          {/* Enhanced Active Deals Table */}
          <EnhancedDealsTable 
            deals={dealHealthData} 
            loading={loading} 
          />
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default DashboardMain;
