import React from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { MyDealsWidget } from './widgets/MyDealsWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { MetricsHeader } from './MetricsHeader';

const DashboardMain = () => {
  return (
    <AdminDashboardLayout activeTab="dashboard">
      <div className="min-h-screen bg-secondary/30">
        <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Broker Dashboard
            </h1>
            <p className="text-base text-muted-foreground">
              Manage your M&A deals and investor relationships
            </p>
          </div>

          {/* Metrics Row */}
          <div className="mb-6">
            <MetricsHeader />
          </div>

          {/* Main Content Grid - My Deals (66%) + Quick Actions (33%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Deals Widget - 2 columns (66% width) */}
            <div className="lg:col-span-2">
              <MyDealsWidget />
            </div>
            
            {/* Quick Actions Widget - 1 column (33% width) */}
            <div className="lg:col-span-1">
              <QuickActionsWidget />
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default DashboardMain;
