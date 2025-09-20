import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { MyDealsWidget } from './widgets/MyDealsWidget';
import { PipelineWidget } from './widgets/PipelineWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { ActivityFeedWidget } from './widgets/ActivityFeedWidget';
import { NDAWidget } from './widgets/NDAWidget';
import { MetricsHeader } from './MetricsHeader';
import { SimpleGrid } from './SimpleGrid';
import { WidgetCustomizer } from './WidgetCustomizer';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardWidget } from '@/types/dashboard';

const STORAGE_KEY = 'dashboard-widgets-v3';

const defaultWidgets: DashboardWidget[] = [
  { 
    id: 'deals-widget', 
    type: 'deals',
    title: 'My Deals',
    description: 'Recent and active deal listings',
    visible: true,
    order: 1
  },
  { 
    id: 'pipeline-widget', 
    type: 'pipeline',
    title: 'Pipeline Analytics',
    description: 'Deal pipeline and conversion stats',
    visible: true,
    order: 2
  },
  { 
    id: 'actions-widget', 
    type: 'actions',
    title: 'Quick Actions',
    description: 'Common tasks and shortcuts',
    visible: true,
    order: 3
  },
  { 
    id: 'activity-widget', 
    type: 'activity',
    title: 'Recent Activity',
    description: 'Latest actions and updates',
    visible: true,
    order: 4
  },
  { 
    id: 'nda-widget', 
    type: 'nda',
    title: 'NDA Management',
    description: 'Non-disclosure agreement tracking',
    visible: true,
    order: 5
  }
];

const DashboardMain = () => {
  const [widgets, setWidgets] = React.useState<DashboardWidget[]>(defaultWidgets);
  const [dragState, setDragState] = React.useState<{
    isDragging: boolean;
    draggedWidget: DashboardWidget | null;
  }>({
    isDragging: false,
    draggedWidget: null
  });

  // Load widgets from localStorage on mount
  React.useEffect(() => {
    try {
      const savedWidgets = localStorage.getItem(STORAGE_KEY);
      
      if (savedWidgets) {
        const parsedWidgets = JSON.parse(savedWidgets);
        // Validate that parsedWidgets is an array
        if (Array.isArray(parsedWidgets)) {
          setWidgets(parsedWidgets);
        } else {
          console.warn('Invalid widgets data in localStorage, using defaults');
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard widgets:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save widgets to localStorage
  const saveWidgets = React.useCallback((newWidgets: DashboardWidget[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
    } catch (error) {
      console.error('Failed to save dashboard widgets:', error);
    }
  }, []);

  const toggleWidgetVisibility = React.useCallback((widgetId: string) => {
    setWidgets(prev => {
      // Ensure prev is always an array
      if (!Array.isArray(prev)) {
        console.warn('Widgets state is not an array, resetting to defaults');
        return defaultWidgets;
      }
      const updated = prev.map(widget =>
        widget.id === widgetId 
          ? { ...widget, visible: !widget.visible }
          : widget
      );
      saveWidgets(updated);
      return updated;
    });
  }, [saveWidgets]);

  const resetLayout = React.useCallback(() => {
    setWidgets(defaultWidgets);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleDragStart = React.useCallback((widget: DashboardWidget, event: React.DragEvent) => {
    if (widget.locked) return;
    setDragState({ isDragging: true, draggedWidget: widget });
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = React.useCallback(() => {
    setDragState({ isDragging: false, draggedWidget: null });
  }, []);

  const handleDrop = React.useCallback((targetWidget: DashboardWidget, event: React.DragEvent) => {
    event.preventDefault();
    if (!dragState.draggedWidget || dragState.draggedWidget.id === targetWidget.id) return;

    // Swap order instead of positions
    setWidgets(prev => {
      const updated = prev.map(widget => {
        if (widget.id === dragState.draggedWidget!.id) {
          return { ...widget, order: targetWidget.order };
        }
        if (widget.id === targetWidget.id) {
          return { ...widget, order: dragState.draggedWidget!.order };
        }
        return widget;
      });
      saveWidgets(updated);
      return updated;
    });

    setDragState({ isDragging: false, draggedWidget: null });
  }, [dragState.draggedWidget, saveWidgets]);

  const getWidgetComponent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'deals': return <MyDealsWidget />;
      case 'pipeline': return <PipelineWidget />;
      case 'actions': return <QuickActionsWidget />;
      case 'activity': return <ActivityFeedWidget />;
      case 'nda': return <NDAWidget />;
      default: return <div>Unknown widget</div>;
    }
  };

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
                <WidgetCustomizer 
                  widgets={widgets}
                  onToggleVisibility={toggleWidgetVisibility}
                  onReset={resetLayout}
                />
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

        {/* Fixed Metrics Header */}
        <MetricsHeader />

        {/* Simple Widget Grid */}
        {Array.isArray(widgets) && widgets.filter(w => w.visible).length > 0 ? (
          <SimpleGrid
            widgets={widgets}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            renderWidget={getWidgetComponent}
            dragState={dragState}
          />
        ) : (
          <div className="text-center py-12">
            <Card className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="text-[#F4E4BC]/60 mb-4">
                  No widgets are currently visible
                </div>
                <WidgetCustomizer 
                  widgets={widgets}
                  onToggleVisibility={toggleWidgetVisibility}
                  onReset={resetLayout}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardMain;