import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

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
    <TableRow className="bg-muted/60 hover:bg-muted/60 border-b border-border">
      <TableCell colSpan={colSpan} className="py-2.5 px-4">
        <div className="flex items-center justify-between">
          {/* Category Path */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Due Diligence List
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-foreground">
              {categoryName}
            </span>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {completedCount}/{totalCount}
            </span>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums w-8">
              {percentage}%
            </span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CategoryHeaderRow;
