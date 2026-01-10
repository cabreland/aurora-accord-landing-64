import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActivityGroupHeaderProps {
  label: string;
  count: number;
  isToday?: boolean;
}

export const ActivityGroupHeader: React.FC<ActivityGroupHeaderProps> = ({ 
  label, 
  count,
  isToday = false 
}) => {
  return (
    <div className={cn(
      'sticky top-0 z-10 flex items-center justify-between px-4 py-3',
      'bg-gradient-to-r from-muted/90 to-muted/70 backdrop-blur-md',
      'border-y border-border/50',
      isToday && 'from-primary/10 to-primary/5'
    )}>
      <div className="flex items-center gap-2">
        {isToday && (
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
        <span className={cn(
          'text-sm font-semibold uppercase tracking-wider',
          isToday ? 'text-primary' : 'text-muted-foreground'
        )}>
          {label}
        </span>
      </div>
      <Badge 
        variant={isToday ? 'default' : 'secondary'} 
        className="text-xs"
      >
        {count} {count === 1 ? 'activity' : 'activities'}
      </Badge>
    </div>
  );
};
