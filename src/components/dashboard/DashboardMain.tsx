import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { MyDealsWidget } from './widgets/MyDealsWidget';
import { PipelineWidget } from './widgets/PipelineWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { ActivityFeedWidget } from './widgets/ActivityFeedWidget';
import { MetricsWidget } from './widgets/MetricsWidget';
import { NDAWidget } from './widgets/NDAWidget';
import { WidgetCustomizer } from './WidgetCustomizer';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardWidget {
  id: string;
  type: 'metrics' | 'deals' | 'pipeline' | 'actions' | 'activity' | 'nda';
  title: string;
  description: string;
  visible: boolean;
  position: { x: number; y: number; width: number; height: number };
  locked?: boolean;
}

const STORAGE_KEY = 'dashboard-layout-simple';

const defaultWidgets: DashboardWidget[] = [
  { 
    id: 'metrics-widget', 
    type: 'metrics',
    title: 'Key Metrics',
    description: 'Pipeline value, active deals, and performance KPIs',
    visible: true,
    position: { x: 0, y: 0, width: 4, height: 1 },
    locked: true
  },
  { 
    id: 'deals-widget', 
    type: 'deals',
    title: 'My Deals',
    description: 'Recent and active deal listings',
    visible: true,
    position: { x: 0, y: 1, width: 2, height: 2 }
  },
  { 
    id: 'pipeline-widget', 
    type: 'pipeline',
    title: 'Pipeline Analytics',
    description: 'Deal pipeline and conversion stats',
    visible: true,
    position: { x: 2, y: 1, width: 2, height: 2 }
  },
  { 
    id: 'actions-widget', 
    type: 'actions',
    title: 'Quick Actions',
    description: 'Common tasks and shortcuts',
    visible: true,
    position: { x: 0, y: 3, width: 2, height: 1 }
  },
  { 
    id: 'activity-widget', 
    type: 'activity',
    title: 'Recent Activity',
    description: 'Latest actions and updates',
    visible: true,
    position: { x: 2, y: 3, width: 2, height: 1 }
  },
  { 
    id: 'nda-widget', 
    type: 'nda',
    title: 'NDA Management',
    description: 'Non-disclosure agreement tracking',
    visible: true,
    position: { x: 0, y: 4, width: 2, height: 1 }
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

  // Load layout from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedWidgets = JSON.parse(saved);
        setWidgets(savedWidgets);
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    }
  }, []);

  // Save layout to localStorage
  const saveLayout = React.useCallback((newWidgets: DashboardWidget[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  }, []);

  const toggleWidgetVisibility = React.useCallback((widgetId: string) => {
    setWidgets(prev => {
      const updated = prev.map(widget =>
        widget.id === widgetId 
          ? { ...widget, visible: !widget.visible }
          : widget
      );
      saveLayout(updated);
      return updated;
    });
  }, [saveLayout]);

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

    // Swap positions
    setWidgets(prev => {
      const updated = prev.map(widget => {
        if (widget.id === dragState.draggedWidget!.id) {
          return { ...widget, position: targetWidget.position };
        }
        if (widget.id === targetWidget.id) {
          return { ...widget, position: dragState.draggedWidget!.position };
        }
        return widget;
      });
      saveLayout(updated);
      return updated;
    });

    setDragState({ isDragging: false, draggedWidget: null });
  }, [dragState.draggedWidget, saveLayout]);

  const getWidgetComponent = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'metrics': return <MetricsWidget />;
      case 'deals': return <MyDealsWidget />;
      case 'pipeline': return <PipelineWidget />;
      case 'actions': return <QuickActionsWidget />;
      case 'activity': return <ActivityFeedWidget />;
      case 'nda': return <NDAWidget />;
      default: return <div>Unknown widget</div>;
    }
  };

  const visibleWidgets = widgets.filter(w => w.visible);

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

        {/* Grid Layout */}
        {visibleWidgets.length > 0 ? (
          <div className="grid grid-cols-4 gap-6 auto-rows-[200px]">
            {visibleWidgets.map((widget) => (
              <div
                key={widget.id}
                draggable={!widget.locked}
                onDragStart={(e) => handleDragStart(widget, e)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(widget, e)}
                className={`
                  relative transition-all duration-200 group
                  ${dragState.draggedWidget?.id === widget.id ? 'opacity-50 scale-95' : ''}
                  ${!widget.locked ? 'cursor-move hover:shadow-lg' : ''}
                `}
                style={{
                  gridColumn: `${widget.position.x + 1} / span ${widget.position.width}`,
                  gridRow: `${widget.position.y + 1} / span ${widget.position.height}`
                }}
              >
                {/* Drag handle */}
                {!widget.locked && (
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 bg-muted/80 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-muted-foreground rounded-sm opacity-60" />
                    </div>
                  </div>
                )}

                {getWidgetComponent(widget.type)}
              </div>
            ))}
          </div>
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