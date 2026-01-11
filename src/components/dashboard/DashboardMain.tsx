import React from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { useMissionControl } from '@/hooks/useMissionControl';
import { PipelineHealthWidget } from './widgets/PipelineHealthWidget';
import { DealsRequiringActionWidget } from './widgets/DealsRequiringActionWidget';
import { ThisWeeksClosingsWidget } from './widgets/ThisWeeksClosingsWidget';
import { RecentActivityFeedWidget } from './widgets/RecentActivityFeedWidget';
import { ActiveDealsWidget } from './widgets/ActiveDealsWidget';

const DashboardMain = () => {
  const {
    loading,
    pipelineHealth,
    dealHealthData,
    dealsRequiringAction,
    thisWeeksClosings,
    recentActivities,
    totalPipelineValue
  } = useMissionControl();

  return (
    <AdminDashboardLayout activeTab="dashboard">
      <div className="min-h-screen bg-[#FAFBFC]">
        <div className="p-8 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Mission Control
            </h1>
            <p className="text-base text-gray-500 mt-1">
              Monitor deal health, track urgent items, and manage your M&A pipeline
            </p>
          </div>

          {/* Priority Metrics Section - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pipeline Health Score */}
            <PipelineHealthWidget 
              pipelineHealth={pipelineHealth} 
              loading={loading} 
            />
            
            {/* Deals Requiring Action */}
            <DealsRequiringActionWidget 
              deals={dealsRequiringAction} 
              loading={loading} 
            />
            
            {/* This Week's Closings */}
            <ThisWeeksClosingsWidget 
              deals={thisWeeksClosings}
              totalPipelineValue={totalPipelineValue}
              loading={loading} 
            />

            {/* Recent Activity Feed */}
            <RecentActivityFeedWidget 
              activities={recentActivities} 
              loading={loading} 
            />
          </div>

          {/* Active Deals Section - Main Content */}
          <ActiveDealsWidget 
            deals={dealHealthData} 
            loading={loading} 
          />
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default DashboardMain;
