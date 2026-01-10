import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestMetricsBarProps {
  metrics: {
    total: number;
    open: number;
    inProgress: number;
    answered: number;
    closed: number;
    overdue: number;
  };
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export const RequestMetricsBar: React.FC<RequestMetricsBarProps> = ({
  metrics,
  activeFilter,
  onFilterChange
}) => {
  const metricCards = [
    {
      id: 'total',
      label: 'Total Requests',
      value: metrics.total,
      icon: MessageSquare,
      color: 'text-foreground',
      bgColor: 'bg-muted/50'
    },
    {
      id: 'open',
      label: 'Open',
      value: metrics.open,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'inProgress',
      label: 'In Progress',
      value: metrics.inProgress,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10'
    },
    {
      id: 'answered',
      label: 'Answered',
      value: metrics.answered,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10'
    },
    {
      id: 'overdue',
      label: 'Overdue',
      value: metrics.overdue,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metricCards.map((metric) => (
        <Card
          key={metric.id}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            activeFilter === metric.id && 'ring-2 ring-primary shadow-md'
          )}
          onClick={() => onFilterChange(activeFilter === metric.id ? null : metric.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', metric.bgColor)}>
                <metric.icon className={cn('h-5 w-5', metric.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
