import React from 'react';
import { Flag } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUpdateDiligenceRequest } from '@/hooks/useDiligenceTracker';
import { toast } from 'sonner';

interface PriorityFlagCellProps {
  requestId: string;
  priority: 'high' | 'medium' | 'low';
}

const priorityConfig = {
  high: { 
    label: 'High Priority', 
    color: 'text-red-500 hover:text-red-600',
    fillColor: 'fill-red-500',
    next: 'low' as const
  },
  medium: { 
    label: 'Medium Priority', 
    color: 'text-amber-500 hover:text-amber-600',
    fillColor: 'fill-amber-500',
    next: 'high' as const
  },
  low: { 
    label: 'Normal Priority', 
    color: 'text-gray-300 hover:text-gray-400',
    fillColor: '',
    next: 'medium' as const
  },
};

const PriorityFlagCell: React.FC<PriorityFlagCellProps> = ({ requestId, priority }) => {
  const updateRequest = useUpdateDiligenceRequest();
  const config = priorityConfig[priority] || priorityConfig.low;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPriority = config.next;
    
    updateRequest.mutate(
      { id: requestId, priority: nextPriority },
      {
        onSuccess: () => {
          toast.success(`Priority set to ${priorityConfig[nextPriority].label.replace(' Priority', '')}`);
        }
      }
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className={`p-1 rounded transition-colors ${config.color}`}
          disabled={updateRequest.isPending}
        >
          <Flag 
            className={`w-4 h-4 ${priority !== 'low' ? config.fillColor : ''}`}
            fill={priority !== 'low' ? 'currentColor' : 'none'}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-gray-900 text-white text-xs">
        {config.label}
        <span className="text-gray-400 block">Click to change</span>
      </TooltipContent>
    </Tooltip>
  );
};

export default PriorityFlagCell;
