import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter, Download, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DiligenceHeaderProps {
  deal?: {
    company_name: string;
    asking_price?: string;
    industry?: string;
  };
  completedCount: number;
  totalCount: number;
  showFilters?: boolean;
  activeFiltersCount?: number;
  onToggleFilters?: () => void;
  onExport?: () => void;
  onAddRequest?: () => void;
}

const DiligenceHeader: React.FC<DiligenceHeaderProps> = ({
  deal,
  completedCount,
  totalCount,
  showFilters = false,
  activeFiltersCount = 0,
  onToggleFilters,
  onExport,
  onAddRequest
}) => {
  const navigate = useNavigate();
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const remainingCount = totalCount - completedCount;
  
  // Progress color based on completion
  const getProgressColor = () => {
    if (percentComplete >= 70) return '#10B981'; // green
    if (percentComplete >= 40) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  // Calculate stroke dasharray for progress ring
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentComplete / 100) * circumference} ${circumference}`;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
      {/* LEFT: Back button + Deal info */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/diligence-tracker')}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 -ml-2 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Deals</span>
        </Button>
        
        <div className="h-5 w-px bg-gray-300 hidden sm:block" />
        
        <div className="flex items-center gap-3">
          {/* Company icon/logo */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">
              {deal?.company_name?.substring(0, 2).toUpperCase() || <Building2 className="w-4 h-4" />}
            </span>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                {deal?.company_name || 'Loading...'}
              </h1>
              <Badge variant="outline" className="text-xs font-normal px-2 py-0 hidden md:flex">
                Due Diligence
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
              {deal?.asking_price && `${deal.asking_price} • `}
              {deal?.industry || 'Digital Agency'}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Progress + Add Request button */}
      <div className="flex items-center gap-4">
        {/* Compact progress indicator */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
          {/* Small circular progress */}
          <div className="relative w-10 h-10">
            <svg className="transform -rotate-90 w-10 h-10">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#E5E7EB"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke={getProgressColor()}
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={`${(percentComplete / 100) * 100.5} 100.5`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900">{percentComplete}%</span>
            </div>
          </div>
          
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight tabular-nums">
              {completedCount} of {totalCount}
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              {remainingCount} remaining
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {onToggleFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className={cn(
                "gap-2 hidden sm:flex",
                showFilters && "bg-blue-50 border-blue-300 text-blue-700"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600 text-white text-[10px]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
          
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2 hidden lg:flex"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
          
          {onAddRequest && (
            <Button
              size="sm"
              onClick={onAddRequest}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Request</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiligenceHeader;
