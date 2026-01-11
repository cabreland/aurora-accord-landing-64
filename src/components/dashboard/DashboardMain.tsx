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
      <div className="min-h-screen bg-secondary/30">
        <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Mission Control
            </h1>
            <p className="text-base text-muted-foreground">
              Monitor deal health, track urgent items, and manage your M&A pipeline
            </p>
          </div>

          {/* Priority Metrics Section - Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Pipeline Health Score - Larger card */}
            <div className="lg:col-span-1">
              <PipelineHealthWidget 
                pipelineHealth={pipelineHealth} 
                loading={loading} 
              />
            </div>
            
            {/* Deals Requiring Action */}
            <div className="lg:col-span-1">
              <DealsRequiringActionWidget 
                deals={dealsRequiringAction} 
                loading={loading} 
              />
            </div>
            
            {/* This Week's Closings */}
            <div className="lg:col-span-1">
              <ThisWeeksClosingsWidget 
                deals={thisWeeksClosings}
                totalPipelineValue={totalPipelineValue}
                loading={loading} 
              />
            </div>

            {/* Recent Activity Feed with Quick Actions */}
            <div className="lg:col-span-1">
              <RecentActivityFeedWidget 
                activities={recentActivities} 
                loading={loading} 
              />
            </div>
          </div>

          {/* Active Deals Section - Main Content */}
          <div>
            <ActiveDealsWidget 
              deals={dealHealthData} 
              loading={loading} 
            />
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default DashboardMain;
