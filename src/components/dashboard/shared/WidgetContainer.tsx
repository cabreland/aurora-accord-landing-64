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
      "bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 hover:border-[#D4AF37]/40 transition-all duration-200 shadow-md hover:shadow-lg",
      className
    )}>
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#FAFAFA] flex items-center gap-3 text-lg font-bold">
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