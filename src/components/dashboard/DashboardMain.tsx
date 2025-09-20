import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { GridEngine } from './core/GridEngine';
import { useLayoutManager } from './core/LayoutManager';
import { useWidgetRegistry } from './core/WidgetRegistry';
import { WidgetCustomizer } from './WidgetCustomizer';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DashboardMain = () => {
  const layoutManager = useLayoutManager();
  const { getWidgetComponent } = useWidgetRegistry();

  const {
    layout,
    dragState,
    gridConfig,
    getVisibleWidgets,
    handleDragStart,
    handleDrop,
    resetLayout
  } = layoutManager;

  // Generate widget components based on visible widgets
  const visibleWidgets = getVisibleWidgets();
  const widgetComponents = visibleWidgets.map(widget => {
    const WidgetComponent = getWidgetComponent(widget.type);
    return WidgetComponent ? (
      <WidgetComponent key={widget.id} {...(widget.props || {})} />
    ) : (
      <div key={widget.id} className="p-4 text-center text-muted-foreground">
        Widget not found: {widget.type}
      </div>
    );
  });

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
                <WidgetCustomizer layoutManager={layoutManager} />
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

        {/* Dynamic Grid Layout */}
        {visibleWidgets.length > 0 ? (
          <GridEngine
            widgets={visibleWidgets}
            config={gridConfig}
            dragState={dragState}
            onWidgetDragStart={handleDragStart}
            onWidgetDrop={handleDrop}
            className="min-h-[600px]"
          >
            {widgetComponents}
          </GridEngine>
        ) : (
          <div className="text-center py-12">
            <Card className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="text-[#F4E4BC]/60 mb-4">
                  No widgets are currently visible
                </div>
                <WidgetCustomizer layoutManager={layoutManager} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardMain;