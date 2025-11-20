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
      "bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-3 text-lg font-bold">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#D4AF37]" />
            </div>
            {title}
          </CardTitle>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-6 pb-6">
        {children}
      </CardContent>
    </Card>
  );
};