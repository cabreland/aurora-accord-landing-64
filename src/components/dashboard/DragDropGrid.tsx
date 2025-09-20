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
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGridItems(items);
  }, [items]);

  const handleDragStart = (e: React.DragEvent, item: GridItem) => {
    if (!item.draggable) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    setDragOverIndex(index);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const dragIndex = gridItems.findIndex(item => item.id === draggedItem.id);
    if (dragIndex === -1 || dragIndex === dropIndex) return;

    const newItems = [...gridItems];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    setGridItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
    
    onLayoutChange?.(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div 
      ref={gridRef}
      className={cn(
        "grid gap-6 w-full",
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
    </div>
  );
};

interface DraggableWidgetProps {
  item: GridItem;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent, item: GridItem) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
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