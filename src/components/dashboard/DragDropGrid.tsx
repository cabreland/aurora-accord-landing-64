import React, { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridItem {
  id: string;
  component: React.ReactNode;
  gridArea: string;
  draggable?: boolean;
}

interface DragDropGridProps {
  items: GridItem[];
  className?: string;
  onLayoutChange?: (items: GridItem[]) => void;
}

export const DragDropGrid = ({ items, className, onLayoutChange }: DragDropGridProps) => {
  const [gridItems, setGridItems] = useState<GridItem[]>(items);
  const [draggedItem, setDraggedItem] = useState<GridItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverArea, setDragOverArea] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Define all possible grid areas for drop zones
  const gridAreas = ['metrics', 'deals', 'pipeline', 'actions', 'activity', 'nda'];
  const visibleItems = items.filter(item => item.id !== 'invisible'); // Filter out hidden widgets

  useEffect(() => {
    setGridItems(visibleItems);
  }, [items]);

  const handleDragStart = (e: React.DragEvent, item: GridItem) => {
    if (!item.draggable) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index?: number, area?: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    if (index !== undefined) {
      setDragOverIndex(index);
      setDragOverArea(null);
    } else if (area) {
      setDragOverArea(area);
      setDragOverIndex(null);
    }
    
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex?: number, dropArea?: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const dragIndex = gridItems.findIndex(item => item.id === draggedItem.id);
    if (dragIndex === -1) return;

    console.log('Drop detected:', { dragIndex, dropIndex, dropArea, draggedItem: draggedItem.id });

    const newItems = [...gridItems];
    
    if (dropIndex !== undefined && dragIndex !== dropIndex) {
      // Dropping on existing widget - swap grid areas
      const draggedGridArea = newItems[dragIndex].gridArea;
      const targetGridArea = newItems[dropIndex].gridArea;
      
      newItems[dragIndex] = { ...newItems[dragIndex], gridArea: targetGridArea };
      newItems[dropIndex] = { ...newItems[dropIndex], gridArea: draggedGridArea };
    } else if (dropArea && newItems[dragIndex].gridArea !== dropArea) {
      // Dropping on empty area - move to that area
      newItems[dragIndex] = { ...newItems[dragIndex], gridArea: dropArea };
    }

    setGridItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
    setDragOverArea(null);
    
    onLayoutChange?.(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    setDragOverArea(null);
  };

  // Get occupied grid areas
  const occupiedAreas = gridItems.map(item => item.gridArea);
  const emptyAreas = gridAreas.filter(area => !occupiedAreas.includes(area));

  return (
    <div 
      ref={gridRef}
      className={cn(
        "grid gap-6 w-full relative",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        "auto-rows-min",
        className
      )}
      style={{
        gridTemplateAreas: `
          "metrics metrics metrics metrics"
          "deals deals pipeline pipeline"
          "deals deals actions actions"  
          "activity activity nda nda"
        `
      }}
    >
      {/* Render visible widgets */}
      {gridItems.map((item, index) => (
        <DraggableWidget
          key={item.id}
          item={item}
          index={index}
          isDragging={draggedItem?.id === item.id}
          isDragOver={dragOverIndex === index}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}
      
      {/* Render empty drop zones */}
      {draggedItem && emptyAreas.map((area) => (
        <EmptyDropZone
          key={`empty-${area}`}
          area={area}
          isDragOver={dragOverArea === area}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

interface DraggableWidgetProps {
  item: GridItem;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent, item: GridItem) => void;
  onDragOver: (e: React.DragEvent, index?: number, area?: string) => void;
  onDrop: (e: React.DragEvent, dropIndex?: number, dropArea?: string) => void;
  onDragEnd: () => void;
}

const DraggableWidget = ({
  item,
  index,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}: DraggableWidgetProps) => {
  return (
    <div
      draggable={item.draggable}
      onDragStart={(e) => onDragStart(e, item)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "relative transition-all duration-200",
        item.gridArea && `[grid-area:${item.gridArea}]`,
        isDragging && "opacity-50 scale-95 z-10",
        isDragOver && "ring-2 ring-primary/30 bg-primary/5",
        item.draggable && "cursor-move hover:shadow-lg"
      )}
      style={{
        gridArea: item.gridArea
      }}
    >
      {item.draggable && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div className="group h-full">
        {item.component}
      </div>
    </div>
  );
};

// Empty drop zone component for unused grid areas
interface EmptyDropZoneProps {
  area: string;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent, index?: number, area?: string) => void;
  onDrop: (e: React.DragEvent, dropIndex?: number, dropArea?: string) => void;
}

const EmptyDropZone = ({ area, isDragOver, onDragOver, onDrop }: EmptyDropZoneProps) => {
  return (
    <div
      onDragOver={(e) => onDragOver(e, undefined, area)}
      onDrop={(e) => onDrop(e, undefined, area)}
      className={cn(
        "min-h-[200px] border-2 border-dashed transition-all duration-200",
        "flex items-center justify-center rounded-lg",
        `[grid-area:${area}]`,
        isDragOver 
          ? "border-primary bg-primary/10 border-solid" 
          : "border-muted-foreground/20 hover:border-muted-foreground/40"
      )}
      style={{ gridArea: area }}
    >
      <div className="text-center text-muted-foreground">
        <div className="text-sm font-medium mb-1">Drop Zone</div>
        <div className="text-xs opacity-60">{area} area</div>
      </div>
    </div>
  );
};