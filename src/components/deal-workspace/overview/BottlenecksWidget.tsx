import React from 'react';
import { AlertTriangle, AlertCircle, Clock, FileX, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DealTab } from '../DealWorkspaceTabs';

export interface Bottleneck {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'documents' | 'requests' | 'team' | 'timeline';
  title: string;
  description: string;
  daysOutstanding?: number;
  targetTab: DealTab;
}

interface BottlenecksWidgetProps {
  bottlenecks: Bottleneck[];
  onResolve: (bottleneck: Bottleneck) => void;
}

const getSeverityStyles = (severity: 'critical' | 'warning' | 'info') => {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-red-50 border-red-200',
        icon: 'text-red-500',
        badge: 'bg-red-100 text-red-700',
        dot: 'bg-red-500',
      };
    case 'warning':
      return {
        bg: 'bg-amber-50 border-amber-200',
        icon: 'text-amber-500',
        badge: 'bg-amber-100 text-amber-700',
        dot: 'bg-amber-500',
      };
    case 'info':
      return {
        bg: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-500',
        badge: 'bg-blue-100 text-blue-700',
        dot: 'bg-blue-500',
      };
  }
};

const getTypeIcon = (type: 'documents' | 'requests' | 'team' | 'timeline') => {
  switch (type) {
    case 'documents':
      return FileX;
    case 'requests':
      return MessageSquare;
    case 'team':
      return Users;
    case 'timeline':
      return Clock;
  }
};

export const BottlenecksWidget: React.FC<BottlenecksWidgetProps> = ({
  bottlenecks,
  onResolve,
}) => {
  if (bottlenecks.length === 0) return null;

  const criticalCount = bottlenecks.filter(b => b.severity === 'critical').length;
  const warningCount = bottlenecks.filter(b => b.severity === 'warning').length;

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-red-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Attention Required
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {warningCount} Warning
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bottlenecks.slice(0, 5).map((bottleneck) => {
          const styles = getSeverityStyles(bottleneck.severity);
          const Icon = getTypeIcon(bottleneck.type);

          return (
            <div
              key={bottleneck.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm',
                styles.bg
              )}
            >
              <div className={cn('p-1.5 rounded', styles.badge)}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', styles.dot)} />
                  <p className="font-medium text-sm">{bottleneck.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {bottleneck.description}
                </p>
                {bottleneck.daysOutstanding && bottleneck.daysOutstanding > 0 && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {bottleneck.daysOutstanding} day{bottleneck.daysOutstanding !== 1 ? 's' : ''} overdue
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-xs h-7"
                onClick={() => onResolve(bottleneck)}
              >
                Resolve
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          );
        })}

        {bottlenecks.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            +{bottlenecks.length - 5} more items requiring attention
          </p>
        )}
      </CardContent>
    </Card>
  );
};
