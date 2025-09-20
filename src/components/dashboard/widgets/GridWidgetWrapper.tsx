import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridWidgetWrapperProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  showDragHandle?: boolean;
}

export const GridWidgetWrapper: React.FC<GridWidgetWrapperProps> = ({
  id,
  title,
  icon: Icon,
  children,
  className,
  headerActions,
  showDragHandle = true
}) => {
  return (
    <Card className={cn(
      "h-full bg-card border border-border shadow-sm",
      "hover:shadow-md transition-all duration-200",
      className
    )}>
      {/* Widget Header */}
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
            <span className="truncate">{title}</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {headerActions}
            {showDragHandle && (
              <div className="cursor-move opacity-60 hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Widget Content */}
      <CardContent className="px-4 pb-4 pt-0 h-full overflow-hidden">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};