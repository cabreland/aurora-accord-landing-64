import React from 'react';
import { format, isThisYear } from 'date-fns';
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
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const date = new Date(lastActivityAt);
  
  // Show date format: "MMM d" for this year, "MMM d, yyyy" for previous years
  const displayText = isThisYear(date) 
    ? format(date, 'MMM d')
    : format(date, 'MMM d, yyyy');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-sm text-foreground whitespace-nowrap">
          {displayText}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-popover text-popover-foreground">
        <div className="text-xs">
          <div>{format(date, 'MMM d, yyyy h:mm a')}</div>
          {updatedBy && (
            <div className="text-muted-foreground mt-0.5">by {updatedBy}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default LastUpdatedCell;
