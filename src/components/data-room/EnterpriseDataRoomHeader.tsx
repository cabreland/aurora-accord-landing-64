import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EnterpriseDataRoomHeaderProps {
  deal?: {
    company_name: string;
    asking_price?: string;
    industry?: string;
  };
  completedCount: number;
  totalCount: number;
  onUploadDocument?: () => void;
}

export const EnterpriseDataRoomHeader: React.FC<EnterpriseDataRoomHeaderProps> = ({
  deal,
  completedCount,
  totalCount,
  onUploadDocument
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

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
      {/* LEFT: Back button + Deal info */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/deals')}
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
                Data Room
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
              {deal?.asking_price && `${deal.asking_price} • `}
              {deal?.industry || 'Documents & Materials'}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Progress + Upload button */}
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

        {/* Upload Button */}
        {onUploadDocument && (
          <Button
            size="sm"
            onClick={onUploadDocument}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Document</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnterpriseDataRoomHeader;
