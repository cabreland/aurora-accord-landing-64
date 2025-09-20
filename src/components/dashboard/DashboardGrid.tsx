import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { cn } from '@/lib/utils';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface GridWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultLayout: {
    w: number;
    h: number;
    x: number;
    y: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

interface DashboardGridProps {
  widgets: GridWidget[];
  onLayoutChange?: (layouts: { [key: string]: Layout[] }) => void;
  className?: string;
}

const STORAGE_KEY = 'dashboard-layouts';

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  onLayoutChange,
  className
}) => {
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [mounted, setMounted] = useState(false);

  // Load saved layouts from localStorage
  useEffect(() => {
    const savedLayouts = localStorage.getItem(STORAGE_KEY);
    if (savedLayouts) {
      try {
        setLayouts(JSON.parse(savedLayouts));
      } catch (error) {
        console.error('Failed to parse saved layouts:', error);
      }
    }
    setMounted(true);
  }, []);

  // Generate default layouts for different breakpoints
  const generateDefaultLayouts = useCallback(() => {
    const defaultLayouts: { [key: string]: Layout[] } = {};
    
    // Define responsive breakpoints
    const breakpoints = {
      lg: widgets.map((widget) => ({
        i: widget.id,
        ...widget.defaultLayout,
      })),
      md: widgets.map((widget, index) => ({
        i: widget.id,
        w: Math.min(widget.defaultLayout.w, 8),
        h: widget.defaultLayout.h,
        x: (index * 6) % 12,
        y: Math.floor((index * 6) / 12) * widget.defaultLayout.h,
        minW: widget.defaultLayout.minW,
        minH: widget.defaultLayout.minH,
        maxW: widget.defaultLayout.maxW,
        maxH: widget.defaultLayout.maxH,
      })),
      sm: widgets.map((widget, index) => ({
        i: widget.id,
        w: Math.min(widget.defaultLayout.w, 6),
        h: widget.defaultLayout.h,
        x: (index * 6) % 6,
        y: Math.floor((index * 6) / 6) * widget.defaultLayout.h,
        minW: Math.min(widget.defaultLayout.minW || 1, 6),
        minH: widget.defaultLayout.minH,
        maxW: Math.min(widget.defaultLayout.maxW || 12, 6),
        maxH: widget.defaultLayout.maxH,
      })),
      xs: widgets.map((widget, index) => ({
        i: widget.id,
        w: Math.min(widget.defaultLayout.w, 4),
        h: widget.defaultLayout.h,
        x: 0,
        y: index * widget.defaultLayout.h,
        minW: Math.min(widget.defaultLayout.minW || 1, 4),
        minH: widget.defaultLayout.minH,
        maxW: Math.min(widget.defaultLayout.maxW || 12, 4),
        maxH: widget.defaultLayout.maxH,
      })),
    };

    return defaultLayouts;
  }, [widgets]);

  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    setLayouts(allLayouts);
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
    } catch (error) {
      console.error('Failed to save layouts:', error);
    }

    onLayoutChange?.(allLayouts);
  }, [onLayoutChange]);

  const resetLayouts = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLayouts({});
  }, []);

  if (!mounted) {
    return <div className="h-96 animate-pulse bg-muted/20 rounded-lg" />;
  }

  const currentLayouts = Object.keys(layouts).length > 0 ? layouts : generateDefaultLayouts();

  return (
    <div className={cn("dashboard-grid", className)}>
      {/* Grid Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <button
          onClick={resetLayouts}
          className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md transition-colors"
        >
          Reset Layout
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={currentLayouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms={true}
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="dashboard-widget bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Widget Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20 cursor-move">
                <h3 className="font-medium text-foreground truncate">{widget.title}</h3>
                <div className="flex items-center space-x-1 opacity-60">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                </div>
              </div>
              
              {/* Widget Content */}
              <div className="flex-1 p-4 overflow-auto">
                {widget.component}
              </div>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};