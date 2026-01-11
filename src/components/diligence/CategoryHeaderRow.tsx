import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

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
    return 'bg-red-400';
  };

  return (
    <TableRow className="bg-slate-50 hover:bg-slate-50 border-y border-gray-200">
      <TableCell colSpan={colSpan} className="py-3.5 px-4">
        <div className="flex items-center justify-between">
          {/* Category Path - bold Due Diligence List with subcategory */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-gray-900 tracking-tight">
              Due Diligence List
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {categoryName}
            </span>
          </div>
          
          {/* Progress Indicator - right side */}
          <div className="flex items-center gap-4">
            {/* Progress dots visualization */}
            <div className="flex items-center gap-1 hidden sm:flex">
              {totalCount > 0 && totalCount <= 10 ? (
                // Show individual dots for small counts
                Array.from({ length: totalCount }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      i < completedCount
                        ? percentage >= 70 ? 'bg-emerald-500' : percentage >= 30 ? 'bg-amber-500' : 'bg-red-400'
                        : 'bg-gray-200'
                    )}
                  />
                ))
              ) : (
                // Show progress bar for larger counts
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", getProgressColor())}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
            
            {/* Count and percentage */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 tabular-nums">
                {completedCount}/{totalCount}
              </span>
              <span className={cn(
                "text-xs font-bold tabular-nums min-w-[36px] text-right px-1.5 py-0.5 rounded",
                percentage >= 70 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : percentage >= 30 
                    ? 'text-amber-700 bg-amber-50' 
                    : 'text-gray-600 bg-gray-100'
              )}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CategoryHeaderRow;