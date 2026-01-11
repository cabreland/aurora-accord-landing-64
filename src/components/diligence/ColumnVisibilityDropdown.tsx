import React from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean; // Can't be hidden
}

interface ColumnVisibilityDropdownProps {
  columns: ColumnConfig[];
  onToggleColumn: (columnId: string) => void;
}

const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({
  columns,
  onToggleColumn,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2 border-gray-200">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white">
        <DropdownMenuLabel className="text-xs text-gray-500">
          Toggle Columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.visible}
            onCheckedChange={() => !column.required && onToggleColumn(column.id)}
            disabled={column.required}
            className="text-sm"
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnVisibilityDropdown;

// Hook for managing column visibility with localStorage persistence
export const useColumnVisibility = (storageKey: string, defaultColumns: ColumnConfig[]) => {
  const [columns, setColumns] = React.useState<ColumnConfig[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, boolean>;
        return defaultColumns.map(col => ({
          ...col,
          visible: parsed[col.id] !== undefined ? parsed[col.id] : col.visible
        }));
      }
    } catch {
      // Ignore parse errors
    }
    return defaultColumns;
  });

  const toggleColumn = React.useCallback((columnId: string) => {
    setColumns(prev => {
      const updated = prev.map(col => 
        col.id === columnId && !col.required 
          ? { ...col, visible: !col.visible } 
          : col
      );
      
      // Save to localStorage
      const visibilityMap = updated.reduce((acc, col) => {
        acc[col.id] = col.visible;
        return acc;
      }, {} as Record<string, boolean>);
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(visibilityMap));
      } catch {
        // Ignore storage errors
      }
      
      return updated;
    });
  }, [storageKey]);

  const isVisible = React.useCallback((columnId: string) => {
    return columns.find(c => c.id === columnId)?.visible ?? true;
  }, [columns]);

  return { columns, toggleColumn, isVisible };
};
