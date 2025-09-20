import { GridConfig, WidgetConfig, DashboardLayout } from '@/types/dashboard';
import { BarChart3, TrendingUp, Building2, AlertTriangle, Activity, Zap, FileText, PieChart } from 'lucide-react';

export const DEFAULT_GRID_CONFIG: GridConfig = {
  breakpoints: {
    sm: 1,
    md: 2, 
    lg: 3,
    xl: 4
  },
  defaultLayout: 'grid',
  spacing: {
    gap: 24,
    padding: 16
  },
  animations: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

export const WIDGET_CATEGORIES = {
  ANALYTICS: 'analytics',
  DEALS: 'deals',
  ACTIVITY: 'activity', 
  ACTIONS: 'actions',
  MANAGEMENT: 'management'
} as const;

export const DEFAULT_WIDGET_CONFIGS: WidgetConfig[] = [
  {
    id: 'metrics',
    component: null, // Will be resolved by registry
    constraints: {
      minWidth: 4,
      minHeight: 1,
      resizable: false,
      draggable: false
    },
    meta: {
      title: 'Key Metrics',
      description: 'Pipeline value, active deals, and performance KPIs',
      category: WIDGET_CATEGORIES.ANALYTICS,
      icon: 'BarChart3'
    }
  },
  {
    id: 'deals',
    component: null,
    constraints: {
      minWidth: 2,
      minHeight: 2,
      resizable: true,
      draggable: true
    },
    meta: {
      title: 'My Deals',
      description: 'Recent and active deal listings with quick actions',
      category: WIDGET_CATEGORIES.DEALS,
      icon: 'Building2'
    }
  },
  {
    id: 'pipeline',
    component: null,
    constraints: {
      minWidth: 2,
      minHeight: 2,
      resizable: true,
      draggable: true
    },
    meta: {
      title: 'Pipeline Analytics',
      description: 'Deal pipeline visualization and conversion statistics',
      category: WIDGET_CATEGORIES.ANALYTICS,
      icon: 'PieChart'
    }
  },
  {
    id: 'actions',
    component: null,
    constraints: {
      minWidth: 2,
      minHeight: 2,
      resizable: true,
      draggable: true
    },
    meta: {
      title: 'Quick Actions',
      description: 'Common tasks and workflow shortcuts',
      category: WIDGET_CATEGORIES.ACTIONS,
      icon: 'Zap'
    }
  },
  {
    id: 'activity',
    component: null,
    constraints: {
      minWidth: 2,
      minHeight: 1,
      resizable: true,
      draggable: true
    },
    meta: {
      title: 'Recent Activity',
      description: 'Latest actions, updates, and notifications',
      category: WIDGET_CATEGORIES.ACTIVITY,
      icon: 'Activity'
    }
  },
  {
    id: 'nda',
    component: null,
    constraints: {
      minWidth: 2,
      minHeight: 1,
      resizable: true,
      draggable: true
    },
    meta: {
      title: 'NDA Management',
      description: 'Non-disclosure agreement tracking and status',
      category: WIDGET_CATEGORIES.MANAGEMENT,
      icon: 'FileText'
    }
  }
];

export const DEFAULT_LAYOUT: DashboardLayout = {
  id: 'default',
  name: 'Default Broker Dashboard',
  widgets: [
    {
      id: 'metrics-widget',
      type: 'metrics',
      position: { x: 0, y: 0, width: 4, height: 1 },
      visible: true,
      locked: true
    },
    {
      id: 'deals-widget',
      type: 'deals',
      position: { x: 0, y: 1, width: 2, height: 2 },
      visible: true
    },
    {
      id: 'pipeline-widget', 
      type: 'pipeline',
      position: { x: 2, y: 1, width: 2, height: 2 },
      visible: true
    },
    {
      id: 'actions-widget',
      type: 'actions',
      position: { x: 2, y: 3, width: 2, height: 1 },
      visible: true
    },
    {
      id: 'activity-widget',
      type: 'activity',
      position: { x: 0, y: 4, width: 2, height: 1 },
      visible: true
    },
    {
      id: 'nda-widget',
      type: 'nda',
      position: { x: 2, y: 4, width: 2, height: 1 },
      visible: true
    }
  ],
  config: DEFAULT_GRID_CONFIG,
  metadata: {
    created: new Date(),
    modified: new Date(),
    version: '1.0.0'
  }
};

export const STORAGE_KEYS = {
  LAYOUT: 'dashboard-layout-v2',
  PREFERENCES: 'dashboard-preferences',
  WIDGET_STATE: 'dashboard-widget-state'
} as const;