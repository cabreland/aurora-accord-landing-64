import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, FileX, Ghost, ChevronRight } from 'lucide-react';
import { DealHealth } from '@/hooks/useMissionControl';

interface DealsRequiringActionWidgetProps {
  deals: DealHealth[];
  loading: boolean;
}

export const DealsRequiringActionWidget: React.FC<DealsRequiringActionWidgetProps> = ({
  deals,
  loading
}) => {
  const getUrgentBadge = (type: 'overdue' | 'pending' | 'missing' | 'stalled') => {
    switch (type) {
      case 'overdue':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'missing':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
            <FileX className="w-3 h-3 mr-1" />
            Missing
          </Badge>
        );
      case 'stalled':
        return (
          <Badge className="bg-muted text-muted-foreground border-border text-xs">
            <Ghost className="w-3 h-3 mr-1" />
            Stalled
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const totalUrgentItems = deals.reduce((sum, d) => sum + d.urgent_items.length, 0);

  return (
    <Card className="p-6 bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Requires Action</h3>
            <p className="text-xs text-muted-foreground">Urgent deal items</p>
          </div>
        </div>
        {totalUrgentItems > 0 && (
          <Badge variant="destructive" className="text-sm">
            {totalUrgentItems} item{totalUrgentItems !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {deals.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">All deals are on track!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              to={`/deal/${deal.id}`}
              className="block"
            >
              <div className="p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm truncate pr-2">
                    {deal.title}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {deal.urgent_items.slice(0, 3).map((item, idx) => (
                    <React.Fragment key={idx}>
                      {getUrgentBadge(item.type)}
                    </React.Fragment>
                  ))}
                  {deal.urgent_items.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{deal.urgent_items.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
