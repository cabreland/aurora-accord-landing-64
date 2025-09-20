import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PlaceholderWidgetProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'chart' | 'list' | 'metric' | 'feed';
}

export const PlaceholderWidget: React.FC<PlaceholderWidgetProps> = ({
  icon: Icon,
  title,
  description,
  children,
  className,
  variant = 'default'
}) => {
  const variants = {
    default: 'bg-gradient-to-br from-background to-muted/20',
    chart: 'bg-gradient-to-br from-blue-50/20 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/30',
    list: 'bg-gradient-to-br from-green-50/20 to-green-100/30 dark:from-green-950/20 dark:to-green-900/30',
    metric: 'bg-gradient-to-br from-purple-50/20 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/30',
    feed: 'bg-gradient-to-br from-orange-50/20 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/30'
  };

  if (children) {
    return (
      <div className={cn("h-full", className)}>
        {children}
      </div>
    );
  }

  return (
    <Card className={cn(
      "h-full border-dashed border-2",
      variants[variant],
      className
    )}>
      <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
        <Icon className="w-12 h-12 text-muted-foreground mb-4" strokeWidth={1.5} />
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Specific widget type components
export const ChartPlaceholder: React.FC<Omit<PlaceholderWidgetProps, 'variant'>> = (props) => (
  <PlaceholderWidget {...props} variant="chart" />
);

export const ListPlaceholder: React.FC<Omit<PlaceholderWidgetProps, 'variant'>> = (props) => (
  <PlaceholderWidget {...props} variant="list" />
);

export const MetricPlaceholder: React.FC<Omit<PlaceholderWidgetProps, 'variant'>> = (props) => (
  <PlaceholderWidget {...props} variant="metric" />
);

export const FeedPlaceholder: React.FC<Omit<PlaceholderWidgetProps, 'variant'>> = (props) => (
  <PlaceholderWidget {...props} variant="feed" />
);