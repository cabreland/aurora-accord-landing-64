import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { MyDealsWidget } from './widgets/MyDealsWidget';
import { PipelineWidget } from './widgets/PipelineWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { ActivityFeedWidget } from './widgets/ActivityFeedWidget';
import { DragDropGrid } from './DragDropGrid';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { BarChart3, TrendingUp, Building2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DashboardMain = () => {
  const { layout, updateLayout, resetLayout } = useDashboardLayout();

  // Create widget components mapping
  const widgetComponents = {
    metrics: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pipeline Value"
          value="$12.5M"
          change="+8.2%"
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Active Deals"
          value="23"
          change="+3"
          icon={Building2}
          trend="up"
        />
        <MetricCard
          title="NDAs Pending"
          value="7"
          change="-2"
          icon={AlertTriangle}
          trend="neutral"
        />
        <MetricCard
          title="Closing This Month"
          value="4"
          change="+1"
          icon={BarChart3}
          trend="up"
        />
      </div>
    ),
    deals: <MyDealsWidget />,
    pipeline: <PipelineWidget />,
    actions: <QuickActionsWidget />,
    activity: <ActivityFeedWidget />,
    nda: (
      <Card className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30">
        <CardHeader>
          <CardTitle className="text-[#FAFAFA] flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            NDA Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-[#F4E4BC]/60 mb-4">
              NDA tracking and management widget coming soon
            </p>
            <div className="text-sm text-[#D4AF37]">Widget in development</div>
          </div>
        </CardContent>
      </Card>
    )
  };

  // Map layout to grid items with components
  const gridItems = layout.map(widget => ({
    ...widget,
    component: widgetComponents[widget.id as keyof typeof widgetComponents]
  }));

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] border border-[#D4AF37]/30 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-[#FAFAFA] mb-2">
                  Broker Dashboard
                </h1>
                <p className="text-xl text-[#F4E4BC]">
                  Comprehensive deal management and analytics for M&A professionals
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetLayout}
                  className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Layout
                </Button>
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] px-4 py-2 rounded-lg">
                  <span className="text-[#0A0F0F] font-semibold text-sm">Live Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Grid Layout with Drag & Drop */}
        <DragDropGrid
          items={gridItems}
          onLayoutChange={updateLayout}
          className="min-h-[600px]"
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