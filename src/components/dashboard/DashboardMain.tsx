import React from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { MyDealsWidget } from './widgets/MyDealsWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { MetricsHeader } from './MetricsHeader';
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
    id: 'actions-widget', 
    type: 'actions',
    title: 'Quick Actions',
    description: 'Common tasks and shortcuts',
    visible: true,
    order: 2
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
      case 'actions': return <QuickActionsWidget />;
      default: return <div>Unknown widget</div>;
    }
  };

  return (
    <AdminDashboardLayout activeTab="dashboard">
      <div className="p-8 space-y-8">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-[32px] font-bold text-[#FAFAFA] mb-2">
            Broker Dashboard
          </h1>
          <p className="text-base text-[#F4E4BC]/60">
            Manage your M&A deals and investor relationships
          </p>
        </div>

        {/* Metrics Row */}
        <div className="mb-8">
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
    </AdminDashboardLayout>
  );
};

export default DashboardMain;