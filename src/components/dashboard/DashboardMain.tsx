import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { DashboardGrid, GridWidget } from './DashboardGrid';
import { MyDealsWidget } from './widgets/MyDealsWidget';
import { PipelineWidget } from './widgets/PipelineWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { ActivityFeedWidget } from './widgets/ActivityFeedWidget';
import { PlaceholderWidget, ChartPlaceholder, MetricPlaceholder } from './widgets/PlaceholderWidget';
import { BarChart3, TrendingUp, Building2, AlertTriangle, Calendar, Users, FileText, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardMain = () => {
  // Define dashboard widgets with their grid properties
  const dashboardWidgets: GridWidget[] = [
    {
      id: 'pipeline-value',
      title: 'Pipeline Value',
      defaultLayout: { w: 3, h: 3, x: 0, y: 0, minW: 2, minH: 2 },
      component: (
        <MetricPlaceholder
          icon={TrendingUp}
          title="$12.5M"
          description="Total pipeline value (+8.2%)"
        />
      )
    },
    {
      id: 'active-deals',
      title: 'Active Deals',
      defaultLayout: { w: 3, h: 3, x: 3, y: 0, minW: 2, minH: 2 },
      component: (
        <MetricPlaceholder
          icon={Building2}
          title="23"
          description="Active deals (+3 this week)"
        />
      )
    },
    {
      id: 'ndas-pending',
      title: 'NDAs Pending',
      defaultLayout: { w: 3, h: 3, x: 6, y: 0, minW: 2, minH: 2 },
      component: (
        <MetricPlaceholder
          icon={AlertTriangle}
          title="7"
          description="Pending NDA approvals"
        />
      )
    },
    {
      id: 'closing-month',
      title: 'Closing This Month',
      defaultLayout: { w: 3, h: 3, x: 9, y: 0, minW: 2, minH: 2 },
      component: (
        <MetricPlaceholder
          icon={BarChart3}
          title="4"
          description="Deals closing this month"
        />
      )
    },
    {
      id: 'my-deals',
      title: 'My Deals',
      defaultLayout: { w: 8, h: 6, x: 0, y: 3, minW: 6, minH: 4 },
      component: <MyDealsWidget />
    },
    {
      id: 'pipeline-overview',
      title: 'Pipeline Overview',
      defaultLayout: { w: 4, h: 6, x: 8, y: 3, minW: 3, minH: 4 },
      component: <PipelineWidget />
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      defaultLayout: { w: 4, h: 4, x: 8, y: 9, minW: 3, minH: 3 },
      component: <QuickActionsWidget />
    },
    {
      id: 'activity-feed',
      title: 'Recent Activity',
      defaultLayout: { w: 8, h: 6, x: 0, y: 9, minW: 6, minH: 4 },
      component: <ActivityFeedWidget />
    },
    {
      id: 'calendar-widget',
      title: 'Upcoming Events',
      defaultLayout: { w: 6, h: 5, x: 0, y: 15, minW: 4, minH: 4 },
      component: (
        <PlaceholderWidget
          icon={Calendar}
          title="Calendar Integration"
          description="Upcoming meetings and deadlines will appear here"
        />
      )
    },
    {
      id: 'team-performance',
      title: 'Team Performance',
      defaultLayout: { w: 6, h: 5, x: 6, y: 15, minW: 4, minH: 4 },
      component: (
        <ChartPlaceholder
          icon={Users}
          title="Team Metrics"
          description="Team performance analytics and KPIs"
        />
      )
    },
    {
      id: 'document-tracker',
      title: 'Document Tracker',
      defaultLayout: { w: 4, h: 4, x: 0, y: 20, minW: 3, minH: 3 },
      component: (
        <PlaceholderWidget
          icon={FileText}
          title="Document Status"
          description="Track document reviews and approvals"
        />
      )
    },
    {
      id: 'targets-goals',
      title: 'Targets & Goals',
      defaultLayout: { w: 4, h: 4, x: 4, y: 20, minW: 3, minH: 3 },
      component: (
        <PlaceholderWidget
          icon={Target}
          title="Monthly Targets"
          description="Progress towards monthly and quarterly goals"
        />
      )
    }
  ];

  const handleLayoutChange = (layouts: { [key: string]: any[] }) => {
    console.log('Layout changed:', layouts);
  };

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-background to-muted/20 border border-border rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Broker Dashboard
                </h1>
                <p className="text-xl text-muted-foreground">
                  Comprehensive deal management and analytics for M&A professionals
                </p>
              </div>
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">Live Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drag & Drop Grid */}
        <DashboardGrid 
          widgets={dashboardWidgets}
          onLayoutChange={handleLayoutChange}
          className="min-h-screen"
        />
      </div>
    </DashboardLayout>
  );
};

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend: 'up' | 'down' | 'neutral';
}) => {
  const trendColors = {
    up: 'text-[#22C55E]',
    down: 'text-[#EF4444]',
    neutral: 'text-[#F4E4BC]'
  };

  return (
    <Card className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 hover:border-[#D4AF37]/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 text-[#D4AF37]" />
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {change}
          </span>
        </div>
        <div>
          <div className="text-3xl font-bold text-[#FAFAFA] mb-1">{value}</div>
          <p className="text-sm text-[#F4E4BC]/60">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardMain;