import { useState, useEffect } from 'react';

export interface DashboardWidget {
  id: string;
  component: React.ReactNode;
  gridArea: string;
  draggable?: boolean;
  visible?: boolean;
  title?: string;
  description?: string;
}

const STORAGE_KEY = 'dashboard-layout';

const defaultLayout: DashboardWidget[] = [
  { 
    id: 'metrics', 
    component: null, 
    gridArea: 'metrics', 
    draggable: false, 
    visible: true,
    title: 'Key Metrics',
    description: 'Pipeline value, active deals, and KPIs'
  },
  { 
    id: 'deals', 
    component: null, 
    gridArea: 'deals', 
    draggable: true, 
    visible: true,
    title: 'My Deals',
    description: 'Recent and active deal listings'
  },
  { 
    id: 'pipeline', 
    component: null, 
    gridArea: 'pipeline', 
    draggable: true, 
    visible: true,
    title: 'Pipeline Analytics',
    description: 'Deal pipeline and conversion stats'
  },
  { 
    id: 'actions', 
    component: null, 
    gridArea: 'actions', 
    draggable: true, 
    visible: true,
    title: 'Quick Actions',
    description: 'Common tasks and shortcuts'
  },
  { 
    id: 'activity', 
    component: null, 
    gridArea: 'activity', 
    draggable: true, 
    visible: true,
    title: 'Recent Activity',
    description: 'Latest actions and updates'
  },
  { 
    id: 'nda', 
    component: null, 
    gridArea: 'nda', 
    draggable: true, 
    visible: true,
    title: 'NDA Management',
    description: 'Non-disclosure agreement tracking'
  }
];

export const useDashboardLayout = () => {
  const [layout, setLayout] = useState<DashboardWidget[]>(defaultLayout);

  // Load layout from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedLayout = JSON.parse(saved);
        // Merge with default to ensure all widgets exist
        const mergedLayout = defaultLayout.map(defaultWidget => {
          const savedWidget = parsedLayout.find((w: DashboardWidget) => w.id === defaultWidget.id);
          return savedWidget ? { ...defaultWidget, ...savedWidget, component: null } : defaultWidget;
        });
        setLayout(mergedLayout);
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    }
  }, []);

  const updateLayout = (newLayout: DashboardWidget[]) => {
    setLayout(newLayout);
    // Save to localStorage (without components)
    try {
      const layoutToSave = newLayout.map(({ component, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutToSave));
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  };

  const resetLayout = () => {
    setLayout(defaultLayout);
    localStorage.removeItem(STORAGE_KEY);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const newLayout = layout.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    );
    updateLayout(newLayout);
  };

  const getVisibleWidgets = () => layout.filter(widget => widget.visible);

  return {
    layout,
    updateLayout,
    resetLayout,
    toggleWidgetVisibility,
    getVisibleWidgets
  };
};