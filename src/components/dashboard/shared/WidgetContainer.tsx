import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export const WidgetContainer = ({ 
  title, 
  icon: Icon, 
  children, 
  className,
  headerActions 
}: WidgetContainerProps) => {
  return (
    <Card className={cn(
      "bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200",
      className
    )}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-3 text-lg font-semibold">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            {title}
          </CardTitle>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent className="pt-5 px-6 pb-6">
        {children}
      </CardContent>
    </Card>
  );
};
