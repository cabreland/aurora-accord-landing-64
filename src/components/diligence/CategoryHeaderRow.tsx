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
    return 'bg-slate-400';
  };

  return (
    <TableRow className="bg-slate-100/80 hover:bg-slate-100/80 border-y border-border">
      <TableCell colSpan={colSpan} className="py-3 px-4">
        <div className="flex items-center justify-between">
          {/* Category Path - bold Due Diligence List with subcategory */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground tracking-tight">
              Due Diligence List
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {categoryName}
            </span>
          </div>
          
          {/* Progress Indicator - right side */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {completedCount} / {totalCount}
            </span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground tabular-nums min-w-[32px] text-right">
              {percentage}%
            </span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CategoryHeaderRow;