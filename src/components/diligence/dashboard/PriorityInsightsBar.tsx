import React from 'react';
import { Button } from '@/components/ui/button';

interface PriorityInsightsBarProps {
  highCount: number;
  mediumCount: number;
  lowCount: number;
  overdueCount: number;
  finalReviewCount: number;
  onFilterPriority: (priority: 'high' | 'medium' | 'low') => void;
}

const PriorityInsightsBar: React.FC<PriorityInsightsBarProps> = ({
  highCount,
  mediumCount,
  lowCount,
  overdueCount,
  finalReviewCount,
  onFilterPriority
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {/* Left: Priority Distribution */}
        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-600 font-medium">Priority:</div>
          <button 
            onClick={() => onFilterPriority('high')}
            className="flex items-center gap-2 hover:scale-105 transition cursor-pointer"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-600 font-semibold">{highCount} High</span>
          </button>
          <button 
            onClick={() => onFilterPriority('medium')}
            className="flex items-center gap-2 hover:scale-105 transition cursor-pointer"
          >
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-amber-600 font-semibold">{mediumCount} Medium</span>
          </button>
          <button 
            onClick={() => onFilterPriority('low')}
            className="flex items-center gap-2 hover:scale-105 transition cursor-pointer"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-600 font-semibold">{lowCount} Low</span>
          </button>
        </div>

        {/* Right: Actionable Insights */}
        <div className="text-right">
          {overdueCount > 0 ? (
            <div className="text-red-600 font-semibold">
              {overdueCount} request{overdueCount > 1 ? 's' : ''} overdue
            </div>
          ) : finalReviewCount > 0 ? (
            <div className="text-purple-600 font-semibold">
              {finalReviewCount} request{finalReviewCount > 1 ? 's' : ''} awaiting review
            </div>
          ) : (
            <div className="text-green-600 font-semibold">
              All requests on track
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriorityInsightsBar;
