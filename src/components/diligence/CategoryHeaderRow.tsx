import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

interface CategoryHeaderRowProps {
  categoryName: string;
  completedCount: number;
  totalCount: number;
  colSpan: number;
}

const CategoryHeaderRow: React.FC<CategoryHeaderRowProps> = ({
  categoryName,
  completedCount,
  totalCount,
  colSpan
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Progress color based on completion
  const getProgressColor = () => {
    if (percentage >= 70) return 'bg-emerald-500';
    if (percentage >= 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <TableRow className="bg-muted/50 hover:bg-muted/50 border-y border-border">
      <TableCell colSpan={colSpan} className="py-2 px-4">
        <div className="flex items-center justify-between">
          {/* Category Path - matching reference design */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">
              Due Diligence List
            </span>
            <span className="text-muted-foreground/60">/</span>
            <span className="font-semibold text-foreground">
              {categoryName}
            </span>
          </div>
          
          {/* Progress Indicator - positioned on right like reference */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {completedCount} / {totalCount}
            </span>
            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums w-8 text-right">
              {percentage}%
            </span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CategoryHeaderRow;