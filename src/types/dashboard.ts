export interface DashboardWidget {
  id: string;
  type: 'metrics' | 'deals' | 'pipeline' | 'actions' | 'activity' | 'nda';
  title: string;
  description: string;
  visible: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
  order: number;
  locked?: boolean;
}

export interface LayoutConfig {
  type: 'grid' | 'masonry' | 'list';
  columns: number;
  gap: number;
  responsive: boolean;
}

export const WIDGET_SIZES = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-1', 
  large: 'col-span-2 row-span-2',
  full: 'col-span-full row-span-1'
} as const;

export const LAYOUT_PRESETS: Record<string, LayoutConfig> = {
  'auto-grid': { type: 'grid', columns: 4, gap: 6, responsive: true },
  'compact-grid': { type: 'grid', columns: 6, gap: 4, responsive: true },
  'masonry': { type: 'masonry', columns: 4, gap: 6, responsive: true },
  'list': { type: 'list', columns: 1, gap: 4, responsive: false }
};