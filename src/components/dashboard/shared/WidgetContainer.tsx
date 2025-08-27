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
      "bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#FAFAFA] flex items-center gap-3">
            <Icon className="w-5 h-5 text-[#D4AF37]" />
            {title}
          </CardTitle>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};