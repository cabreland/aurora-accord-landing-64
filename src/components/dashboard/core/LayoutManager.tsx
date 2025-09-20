import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout, DashboardWidget, DropZone, DragState, LayoutManagerState } from '@/types/dashboard';
import { DEFAULT_LAYOUT, STORAGE_KEYS } from '@/config/dashboardConfig';
import { useWidgetRegistry } from './WidgetRegistry';

export const useLayoutManager = (initialLayout?: DashboardLayout) => {
  const { getAllWidgets } = useWidgetRegistry();
  
  const [state, setState] = useState<LayoutManagerState>({
    currentLayout: initialLayout || DEFAULT_LAYOUT,
    availableWidgets: getAllWidgets(),
    dragState: {
      isDragging: false,
      draggedWidget: null,
      dragOffset: { x: 0, y: 0 },
      dropZones: []
    },
    gridConfig: DEFAULT_LAYOUT.config
  });

  // Load layout from storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT);
      if (saved) {
        const savedLayout = JSON.parse(saved) as DashboardLayout;
        setState(prev => ({
          ...prev,
          currentLayout: {
            ...savedLayout,
            metadata: {
              ...savedLayout.metadata,
              modified: new Date()
            }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    }
  }, []);

  // Save layout to storage whenever it changes
  const saveLayout = useCallback((layout: DashboardLayout) => {
    try {
      const layoutToSave = {
        ...layout,
        metadata: {
          ...layout.metadata,
          modified: new Date()
        }
      };
      localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(layoutToSave));
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  }, []);

  // Widget visibility management
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setState(prev => {
      const updatedLayout = {
        ...prev.currentLayout,
        widgets: prev.currentLayout.widgets.map(widget =>
          widget.id === widgetId
            ? { ...widget, visible: !widget.visible }
            : widget
        )
      };
      
      saveLayout(updatedLayout);
      
      return {
        ...prev,
        currentLayout: updatedLayout
      };
    });
  }, [saveLayout]);

  const setWidgetVisibility = useCallback((widgetId: string, visible: boolean) => {
    setState(prev => {
      const updatedLayout = {
        ...prev.currentLayout,
        widgets: prev.currentLayout.widgets.map(widget =>
          widget.id === widgetId
            ? { ...widget, visible }
            : widget
        )
      };
      
      saveLayout(updatedLayout);
      
      return {
        ...prev,
        currentLayout: updatedLayout
      };
    });
  }, [saveLayout]);

  // Widget positioning
  const moveWidget = useCallback((widgetId: string, newPosition: { x: number; y: number; width?: number; height?: number }) => {
    setState(prev => {
      const updatedLayout = {
        ...prev.currentLayout,
        widgets: prev.currentLayout.widgets.map(widget =>
          widget.id === widgetId
            ? { 
                ...widget, 
                position: { 
                  ...widget.position, 
                  ...newPosition,
                  width: newPosition.width ?? widget.position.width,
                  height: newPosition.height ?? widget.position.height
                } 
              }
            : widget
        )
      };
      
      saveLayout(updatedLayout);
      
      return {
        ...prev,
        currentLayout: updatedLayout
      };
    });
  }, [saveLayout]);

  // Generate drop zones based on current layout
  const generateDropZones = useCallback((excludeWidgetId?: string): DropZone[] => {
    const { widgets } = state.currentLayout;
    const { breakpoints } = state.gridConfig;
    
    const occupiedPositions = new Set<string>();
    
    // Mark occupied positions
    widgets
      .filter(w => w.visible && w.id !== excludeWidgetId)
      .forEach(widget => {
        for (let x = widget.position.x; x < widget.position.x + widget.position.width; x++) {
          for (let y = widget.position.y; y < widget.position.y + widget.position.height; y++) {
            occupiedPositions.add(`${x},${y}`);
          }
        }
      });

    const dropZones: DropZone[] = [];
    const maxCols = breakpoints.xl;
    const maxRows = Math.max(4, Math.max(...widgets.map(w => w.position.y + w.position.height)) + 2);

    // Generate potential drop zones
    for (let y = 0; y < maxRows; y++) {
      for (let x = 0; x < maxCols; x++) {
        const posKey = `${x},${y}`;
        if (!occupiedPositions.has(posKey)) {
          // Try different sizes (1x1, 2x1, 1x2, 2x2)
          const sizes = [
            { width: 1, height: 1 },
            { width: 2, height: 1 },
            { width: 1, height: 2 },
            { width: 2, height: 2 }
          ];

          sizes.forEach(size => {
            if (x + size.width <= maxCols && y + size.height <= maxRows) {
              let canPlace = true;
              for (let dx = 0; dx < size.width; dx++) {
                for (let dy = 0; dy < size.height; dy++) {
                  if (occupiedPositions.has(`${x + dx},${y + dy}`)) {
                    canPlace = false;
                    break;
                  }
                }
                if (!canPlace) break;
              }

              if (canPlace) {
                dropZones.push({
                  id: `drop-${x}-${y}-${size.width}x${size.height}`,
                  x,
                  y,
                  width: size.width,
                  height: size.height,
                  accepts: ['*'],
                  occupied: false
                });
              }
            }
          });
        }
      }
    }

    return dropZones;
  }, [state.currentLayout, state.gridConfig]);

  // Drag and drop handlers
  const handleDragStart = useCallback((widget: DashboardWidget, event: React.DragEvent) => {
    if (widget.locked) return;

    const dropZones = generateDropZones(widget.id);
    
    setState(prev => ({
      ...prev,
      dragState: {
        isDragging: true,
        draggedWidget: widget,
        dragOffset: { x: 0, y: 0 }, // Could calculate from mouse position
        dropZones
      }
    }));

    event.dataTransfer.effectAllowed = 'move';
  }, [generateDropZones]);

  const handleDrop = useCallback((widget: DashboardWidget, position: { x: number; y: number }) => {
    if (!state.dragState.isDragging || !state.dragState.draggedWidget) return;

    moveWidget(state.dragState.draggedWidget.id, position);
    
    setState(prev => ({
      ...prev,
      dragState: {
        isDragging: false,
        draggedWidget: null,
        dragOffset: { x: 0, y: 0 },
        dropZones: []
      }
    }));
  }, [state.dragState, moveWidget]);

  const handleDragEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      dragState: {
        isDragging: false,
        draggedWidget: null,
        dragOffset: { x: 0, y: 0 },
        dropZones: []
      }
    }));
  }, []);

  // Layout management
  const resetLayout = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentLayout: DEFAULT_LAYOUT
    }));
    localStorage.removeItem(STORAGE_KEYS.LAYOUT);
  }, []);

  const updateLayout = useCallback((newLayout: DashboardLayout) => {
    setState(prev => ({
      ...prev,
      currentLayout: newLayout
    }));
    saveLayout(newLayout);
  }, [saveLayout]);

  // Utility functions
  const getVisibleWidgets = useCallback(() => {
    return state.currentLayout.widgets.filter(widget => widget.visible);
  }, [state.currentLayout.widgets]);

  const getWidget = useCallback((widgetId: string) => {
    return state.currentLayout.widgets.find(widget => widget.id === widgetId);
  }, [state.currentLayout.widgets]);

  return {
    // State
    layout: state.currentLayout,
    availableWidgets: state.availableWidgets,
    dragState: state.dragState,
    gridConfig: state.gridConfig,
    
    // Widget management
    toggleWidgetVisibility,
    setWidgetVisibility,
    moveWidget,
    getVisibleWidgets,
    getWidget,
    
    // Drag and drop
    handleDragStart,
    handleDrop,
    handleDragEnd,
    generateDropZones,
    
    // Layout management
    resetLayout,
    updateLayout,
    saveLayout
  };
};

export type LayoutManager = ReturnType<typeof useLayoutManager>;