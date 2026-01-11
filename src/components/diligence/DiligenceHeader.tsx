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
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* LEFT: Back + Deal Context */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/diligence-tracker')}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Deals</span>
          </Button>
          
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          
          <div className="flex items-center gap-3">
            {/* Deal Avatar */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {deal?.company_name?.substring(0, 2).toUpperCase() || <Building2 className="w-5 h-5" />}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                  {deal?.company_name || 'Loading...'}
                </h1>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hidden md:flex">
                  Due Diligence
                </Badge>
              </div>
              {deal?.asking_price && (
                <p className="text-sm text-gray-500 hidden sm:block">
                  {deal.asking_price} {deal.industry && `• ${deal.industry}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Progress + Actions */}
        <div className="flex items-center gap-4">
          {/* Progress Indicator - Enterprise Style */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            {/* Circular Progress Ring */}
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke={getProgressColor()}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900 tabular-nums">
                  {percentComplete}%
                </span>
              </div>
            </div>
            
            {/* Text stats */}
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-gray-900 tabular-nums">
                {completedCount} of {totalCount} Complete
              </div>
              <div className="text-xs text-gray-500">
                {remainingCount} remaining
              </div>
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
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Request</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiligenceHeader;
