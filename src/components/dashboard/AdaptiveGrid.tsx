import React from 'react';
import { DashboardWidget, LayoutConfig, WIDGET_SIZES } from '@/types/dashboard';

interface AdaptiveGridProps {
  widgets: DashboardWidget[];
  layout: LayoutConfig;
  onDragStart?: (widget: DashboardWidget, event: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (targetWidget: DashboardWidget, event: React.DragEvent) => void;
  renderWidget: (widget: DashboardWidget) => React.ReactNode;
  dragState?: { isDragging: boolean; draggedWidget: DashboardWidget | null };
}

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  widgets,
  layout,
  onDragStart,
  onDragEnd,
  onDrop,
  renderWidget,
  dragState
}) => {
  const sortedWidgets = [...widgets]
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  const getGridClasses = () => {
    const baseClasses = `gap-${layout.gap}`;
    
    switch (layout.type) {
      case 'grid':
        return `grid ${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${layout.columns} xl:grid-cols-${Math.min(layout.columns + 1, 6)} 2xl:grid-cols-${Math.min(layout.columns + 2, 8)} auto-rows-[minmax(200px,auto)]`;
      case 'masonry':
        return `columns-1 sm:columns-2 md:columns-3 lg:columns-${layout.columns} xl:columns-${Math.min(layout.columns + 1, 5)} 2xl:columns-${Math.min(layout.columns + 2, 6)} ${baseClasses}`;
      case 'list':
        return `flex flex-col ${baseClasses}`;
      default:
        return `grid ${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-[minmax(200px,auto)]`;
    }
  };

  const getWidgetClasses = (widget: DashboardWidget) => {
    if (layout.type === 'masonry') {
      return 'break-inside-avoid mb-6';
    }
    
    if (layout.type === 'list') {
      return 'w-full';
    }

    // For grid layout, use size-based spans
    const sizeClass = WIDGET_SIZES[widget.size];
    const responsiveClass = layout.responsive 
      ? `${sizeClass} sm:col-span-1` 
      : sizeClass;
    
    return responsiveClass;
  };

  if (layout.type === 'masonry') {
    return (
      <div className={getGridClasses()}>
        {sortedWidgets.map((widget) => (
          <div
            key={widget.id}
            draggable={!widget.locked}
            onDragStart={(e) => onDragStart?.(widget, e)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop?.(widget, e)}
            className={`
              ${getWidgetClasses(widget)} 
              relative transition-all duration-200 group
              ${dragState?.draggedWidget?.id === widget.id ? 'opacity-50 scale-95' : ''}
              ${!widget.locked ? 'cursor-move hover:shadow-lg' : ''}
            `}
          >
            {/* Drag handle */}
            {!widget.locked && (
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-muted/80 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-muted-foreground rounded-sm opacity-60" />
                </div>
              </div>
            )}
            {renderWidget(widget)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={getGridClasses()}>
      {sortedWidgets.map((widget) => (
        <div
          key={widget.id}
          draggable={!widget.locked}
          onDragStart={(e) => onDragStart?.(widget, e)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop?.(widget, e)}
          className={`
            ${getWidgetClasses(widget)} 
            relative transition-all duration-200 group
            ${dragState?.draggedWidget?.id === widget.id ? 'opacity-50 scale-95' : ''}
            ${!widget.locked ? 'cursor-move hover:shadow-lg' : ''}
          `}
        >
          {/* Drag handle */}
          {!widget.locked && (
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-6 h-6 bg-muted/80 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-muted-foreground rounded-sm opacity-60" />
              </div>
            </div>
          )}
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
};