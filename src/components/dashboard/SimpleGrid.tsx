import React from 'react';
import { DashboardWidget } from '@/types/dashboard';

interface SimpleGridProps {
  widgets: DashboardWidget[];
  onDragStart?: (widget: DashboardWidget, event: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (targetWidget: DashboardWidget, event: React.DragEvent) => void;
  renderWidget: (widget: DashboardWidget) => React.ReactNode;
  dragState?: { isDragging: boolean; draggedWidget: DashboardWidget | null };
}

export const SimpleGrid: React.FC<SimpleGridProps> = ({
  widgets,
  onDragStart,
  onDragEnd,
  onDrop,
  renderWidget,
  dragState
}) => {
  const sortedWidgets = [...widgets]
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(300px,auto)]">
      {sortedWidgets.map((widget) => (
        <div
          key={widget.id}
          draggable={!widget.locked}
          onDragStart={(e) => onDragStart?.(widget, e)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop?.(widget, e)}
          className={`
            relative transition-all duration-200 group h-full
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