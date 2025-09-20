import { useState, useEffect } from 'react';

export interface DashboardWidget {
  id: string;
  component: React.ReactNode;
  gridArea: string;
  draggable?: boolean;
}

const STORAGE_KEY = 'dashboard-layout';

const defaultLayout: DashboardWidget[] = [
  { id: 'metrics', component: null, gridArea: 'metrics', draggable: false },
  { id: 'deals', component: null, gridArea: 'deals', draggable: true },
  { id: 'pipeline', component: null, gridArea: 'pipeline', draggable: true },
  { id: 'actions', component: null, gridArea: 'actions', draggable: true },
  { id: 'activity', component: null, gridArea: 'activity', draggable: true },
  { id: 'nda', component: null, gridArea: 'nda', draggable: true }
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

  return {
    layout,
    updateLayout,
    resetLayout
  };
};