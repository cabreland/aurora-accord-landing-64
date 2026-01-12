import React, { useState } from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { WelcomeBand } from './widgets/WelcomeBand';
import { MyTasksWidget } from './widgets/MyTasksWidget';
import { ActiveDealsWidget } from './widgets/ActiveDealsWidget';
import { RecentActivityWidget } from './widgets/RecentActivityWidget';
import { ActionRequiredWidget } from './widgets/ActionRequiredWidget';

// Widget configuration for future personalization
type WidgetId = 'myTasks' | 'activeDeals' | 'recentActivity' | 'actionRequired';

interface WidgetConfig {
  id: WidgetId;
  component: React.ComponentType;
  gridClass: string;
}

const widgetRegistry: WidgetConfig[] = [
  { id: 'myTasks', component: MyTasksWidget, gridClass: 'col-span-1 lg:col-span-2' },
  { id: 'actionRequired', component: ActionRequiredWidget, gridClass: 'col-span-1' },
  { id: 'activeDeals', component: ActiveDealsWidget, gridClass: 'col-span-1 lg:col-span-2' },
  { id: 'recentActivity', component: RecentActivityWidget, gridClass: 'col-span-1' },
];

const DashboardMain = () => {
  // Future: this could come from user preferences / API
  const [enabledWidgets] = useState<WidgetId[]>([
    'myTasks',
    'activeDeals', 
    'recentActivity',
    'actionRequired'
  ]);

  const visibleWidgets = widgetRegistry.filter(w => enabledWidgets.includes(w.id));

  return (
    <AdminDashboardLayout activeTab="dashboard">
      <div className="min-h-screen">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Page Header */}
          <div className="mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Mission Control
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor deals, track tasks, and manage your M&A pipeline
            </p>
          </div>

          {/* Welcome Band */}
          <WelcomeBand />

          {/* Modular Widget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWidgets.map((widget) => {
              const WidgetComponent = widget.component;
              return (
                <div key={widget.id} className={widget.gridClass}>
                  <WidgetComponent />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default DashboardMain;
