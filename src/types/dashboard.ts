export type GridBreakpoint = 'sm' | 'md' | 'lg' | 'xl';
export type LayoutStrategy = 'grid' | 'masonry' | 'flex';
export type WidgetSize = 'small' | 'medium' | 'large' | 'auto';

export interface GridConfig {
  breakpoints: Record<GridBreakpoint, number>;
  defaultLayout: LayoutStrategy;
  spacing: {
    gap: number;
    padding: number;
  };
  animations: {
    duration: number;
    easing: string;
  };
}

export interface WidgetConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  resizable?: boolean;
  draggable?: boolean;
}

export interface WidgetMeta {
  title: string;
  description: string;
  category: string;
  icon?: string;
  preview?: string;
}

export interface WidgetConfig {
  id: string;
  component: React.ComponentType<any>;
  constraints: WidgetConstraints;
  meta: WidgetMeta;
  defaultProps?: Record<string, any>;
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible: boolean;
  locked?: boolean;
  props?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  config: GridConfig;
  metadata: {
    created: Date;
    modified: Date;
    version: string;
  };
}

export interface DragState {
  isDragging: boolean;
  draggedWidget: DashboardWidget | null;
  dragOffset: { x: number; y: number };
  dropZones: DropZone[];
}

export interface DropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  accepts: string[];
  occupied: boolean;
}

export interface LayoutManagerState {
  currentLayout: DashboardLayout;
  availableWidgets: WidgetConfig[];
  dragState: DragState;
  gridConfig: GridConfig;
}