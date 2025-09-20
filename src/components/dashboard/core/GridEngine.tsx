import React, { useMemo } from 'react';
import { DashboardWidget, GridConfig, DropZone } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface GridEngineProps {
  widgets: DashboardWidget[];
  config: GridConfig;
  dragState?: {
    isDragging: boolean;
    draggedWidget: DashboardWidget | null;
    dropZones: DropZone[];
  };
  onWidgetDragStart?: (widget: DashboardWidget, event: React.DragEvent) => void;
  onWidgetDrop?: (widget: DashboardWidget, position: { x: number; y: number }) => void;
  children: React.ReactNode[];
  className?: string;
}

export const GridEngine: React.FC<GridEngineProps> = ({
  widgets,
  config,
  dragState,
  onWidgetDragStart,
  onWidgetDrop,
  children,
  className
}) => {
  // Generate dynamic grid template based on visible widgets
  const gridStyles = useMemo(() => {
    const visibleWidgets = widgets.filter(w => w.visible);
    
    if (visibleWidgets.length === 0) {
      return {
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'auto',
        gap: `${config.spacing.gap}px`
      };
    }

    // Calculate grid dimensions based on widget positions
    const maxX = Math.max(...visibleWidgets.map(w => w.position.x + w.position.width));
    const maxY = Math.max(...visibleWidgets.map(w => w.position.y + w.position.height));
    
    return {
      gridTemplateColumns: `repeat(${Math.max(maxX, config.breakpoints.xl)}, 1fr)`,
      gridTemplateRows: `repeat(${maxY}, minmax(200px, auto))`,
      gap: `${config.spacing.gap}px`,
      padding: `${config.spacing.padding}px`
    };
  }, [widgets, config]);

  // Generate responsive grid classes
  const gridClasses = useMemo(() => {
    const { breakpoints } = config;
    return cn(
      'w-full h-full min-h-screen transition-all',
      'grid auto-rows-min',
      // Responsive columns
      `grid-cols-${breakpoints.sm}`,
      `md:grid-cols-${breakpoints.md}`,
      `lg:grid-cols-${breakpoints.lg}`,
      `xl:grid-cols-${breakpoints.xl}`,
      className
    );
  }, [config, className]);

  return (
    <div 
      className={gridClasses}
      style={{
        ...gridStyles,
        transition: `all ${config.animations.duration}ms ${config.animations.easing}`
      }}
    >
      {/* Render visible widgets */}
      {widgets
        .filter(widget => widget.visible)
        .map((widget, index) => (
          <GridCell
            key={widget.id}
            widget={widget}
            config={config}
            isDragging={dragState?.draggedWidget?.id === widget.id}
            onDragStart={onWidgetDragStart}
            onDrop={onWidgetDrop}
          >
            {children[index]}
          </GridCell>
        ))}

      {/* Render drop zones when dragging */}
      {dragState?.isDragging && dragState.dropZones.map(zone => (
        <DropZoneIndicator
          key={zone.id}
          zone={zone}
          config={config}
        />
      ))}
    </div>
  );
};

interface GridCellProps {
  widget: DashboardWidget;
  config: GridConfig;
  isDragging?: boolean;
  onDragStart?: (widget: DashboardWidget, event: React.DragEvent) => void;
  onDrop?: (widget: DashboardWidget, position: { x: number; y: number }) => void;
  children: React.ReactNode;
}

const GridCell: React.FC<GridCellProps> = ({
  widget,
  config,
  isDragging,
  onDragStart,
  onDrop,
  children
}) => {
  const handleDragStart = (event: React.DragEvent) => {
    if (widget.locked) return;
    onDragStart?.(widget, event);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (rect.width / widget.position.width));
    const y = Math.floor((event.clientY - rect.top) / (rect.height / widget.position.height));
    
    onDrop?.(widget, { x, y });
  };

  return (
    <div
      draggable={!widget.locked}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative transition-all duration-200',
        'group hover:shadow-lg',
        isDragging && 'opacity-50 scale-95 z-50',
        !widget.locked && 'cursor-move',
        widget.locked && 'cursor-not-allowed'
      )}
      style={{
        gridColumn: `${widget.position.x + 1} / span ${widget.position.width}`,
        gridRow: `${widget.position.y + 1} / span ${widget.position.height}`,
        transition: `all ${config.animations.duration}ms ${config.animations.easing}`
      }}
    >
      {/* Drag handle indicator */}
      {!widget.locked && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-muted/80 rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-muted-foreground rounded-sm opacity-60" />
          </div>
        </div>
      )}

      {/* Widget content */}
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  );
};

interface DropZoneIndicatorProps {
  zone: DropZone;
  config: GridConfig;
}

const DropZoneIndicator: React.FC<DropZoneIndicatorProps> = ({ zone, config }) => {
  return (
    <div
      className={cn(
        'border-2 border-dashed border-primary/50 bg-primary/10',
        'flex items-center justify-center rounded-lg',
        'transition-all duration-200',
        zone.occupied && 'border-muted bg-muted/20'
      )}
      style={{
        gridColumn: `${zone.x + 1} / span ${zone.width}`,
        gridRow: `${zone.y + 1} / span ${zone.height}`,
        transition: `all ${config.animations.duration}ms ${config.animations.easing}`
      }}
    >
      <div className="text-center text-muted-foreground">
        <div className="text-sm font-medium">Drop Zone</div>
        <div className="text-xs opacity-60">{zone.width}×{zone.height}</div>
      </div>
    </div>
  );
};

export default GridEngine;