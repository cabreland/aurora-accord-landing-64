import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, FileX, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { DealHealth } from '@/hooks/useMissionControl';

interface DealsRequiringActionWidgetProps {
  deals: DealHealth[];
  loading: boolean;
}

export const DealsRequiringActionWidget: React.FC<DealsRequiringActionWidgetProps> = ({
  deals,
  loading
}) => {
  const getUrgentIcon = (type: 'overdue' | 'pending' | 'missing' | 'stalled') => {
    switch (type) {
      case 'overdue':
        return <Clock className="w-3.5 h-3.5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      case 'missing':
        return <FileX className="w-3.5 h-3.5 text-orange-500" />;
      case 'stalled':
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getUrgentLabel = (type: 'overdue' | 'pending' | 'missing' | 'stalled') => {
    switch (type) {
      case 'overdue': return 'Overdue';
      case 'pending': return 'Pending 48h+';
      case 'missing': return 'Missing docs';
      case 'stalled': return 'Stalled';
    }
  };

  const getUrgentBgColor = (type: 'overdue' | 'pending' | 'missing' | 'stalled') => {
    switch (type) {
      case 'overdue': return 'bg-red-50 text-red-700';
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'missing': return 'bg-orange-50 text-orange-700';
      case 'stalled': return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl h-full">
        <Skeleton className="h-4 w-28 mb-6" />
        <Skeleton className="h-8 w-16 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const totalUrgentItems = deals.reduce((sum, d) => sum + d.urgent_items.length, 0);
  const displayDeals = deals.slice(0, 4);

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Requires Action
        </span>
        {totalUrgentItems > 0 && (
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
            {totalUrgentItems} item{totalUrgentItems !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Count Display */}
      <div className="mb-4">
        <span className="text-4xl font-bold text-gray-900">{deals.length}</span>
        <span className="text-lg text-gray-400 ml-2">deals</span>
      </div>

      {deals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">All clear!</p>
          <p className="text-xs text-gray-500">No urgent items</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {displayDeals.map((deal) => (
            <Link
              key={deal.id}
              to={`/deal/${deal.id}`}
              className="block group"
            >
              <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm truncate pr-2 group-hover:text-blue-600 transition-colors">
                    {deal.title}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {deal.urgent_items.slice(0, 2).map((item, idx) => (
                    <span 
                      key={idx}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${getUrgentBgColor(item.type)}`}
                    >
                      {getUrgentIcon(item.type)}
                      {getUrgentLabel(item.type)}
                    </span>
                  ))}
                  {deal.urgent_items.length > 2 && (
                    <span className="text-xs text-gray-500 px-2 py-0.5">
                      +{deal.urgent_items.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {deals.length > 4 && (
        <Link 
          to="/deals?filter=urgent" 
          className="mt-4 pt-4 border-t border-gray-100 text-center"
        >
          <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all {deals.length} deals →
          </span>
        </Link>
      )}
    </Card>
  );
};
