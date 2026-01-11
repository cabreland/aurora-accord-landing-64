import React from 'react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LastUpdatedCellProps {
  lastActivityAt: string | null;
  updatedBy?: string | null;
}

const LastUpdatedCell: React.FC<LastUpdatedCellProps> = ({ lastActivityAt, updatedBy }) => {
  if (!lastActivityAt) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const date = new Date(lastActivityAt);
  const daysDiff = differenceInDays(new Date(), date);
  
  // Use relative time for recent updates (<7 days), otherwise use date format
  const displayText = daysDiff < 7 
    ? formatDistanceToNow(date, { addSuffix: true })
    : format(date, 'MMM d');

  // Shorten "less than a minute ago" to "just now"
  const shortText = displayText
    .replace('less than a minute ago', 'just now')
    .replace(' minutes ago', 'm ago')
    .replace(' minute ago', 'm ago')
    .replace(' hours ago', 'h ago')
    .replace(' hour ago', 'h ago')
    .replace(' days ago', 'd ago')
    .replace(' day ago', 'd ago')
    .replace('about ', '');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`text-xs whitespace-nowrap ${
          daysDiff < 1 ? 'text-blue-600 font-medium' : 'text-gray-500'
        }`}>
          {shortText}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-900 text-white">
        <div className="text-xs">
          <div>{format(date, 'MMM d, yyyy h:mm a')}</div>
          {updatedBy && (
            <div className="text-gray-400 mt-0.5">by {updatedBy}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default LastUpdatedCell;
