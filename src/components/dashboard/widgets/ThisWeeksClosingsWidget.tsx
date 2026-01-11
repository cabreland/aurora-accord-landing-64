import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import { DealHealth } from '@/hooks/useMissionControl';

interface ThisWeeksClosingsWidgetProps {
  deals: DealHealth[];
  totalPipelineValue: number;
  loading: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

export const ThisWeeksClosingsWidget: React.FC<ThisWeeksClosingsWidgetProps> = ({
  deals,
  totalPipelineValue,
  loading
}) => {
  const getProbabilityStyle = (probability: number) => {
    if (probability >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600' };
    if (probability >= 50) return { bg: 'bg-amber-500', text: 'text-amber-600' };
    return { bg: 'bg-orange-500', text: 'text-orange-600' };
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl h-full">
        <Skeleton className="h-4 w-28 mb-6" />
        <Skeleton className="h-10 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-6" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl h-full flex flex-col">
      {/* Header */}
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Closing Soon
      </span>

      {/* Value Display with Gold Accent */}
      <div className="mb-6">
        <p className="text-4xl font-bold text-[#B8860B] tracking-tight">
          {formatCurrency(totalPipelineValue)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Probability-weighted value
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-6">
          <p className="text-sm text-gray-500">No deals in final stages</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {deals.slice(0, 4).map((deal) => {
            const style = getProbabilityStyle(deal.close_probability);
            return (
              <Link
                key={deal.id}
                to={`/deal/${deal.id}`}
                className="block group"
              >
                <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate pr-2 group-hover:text-blue-600 transition-colors">
                      {deal.title}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {deal.asking_price || 'Price TBD'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${style.bg} rounded-full`}
                          style={{ width: `${deal.close_probability}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${style.text}`}>
                        {deal.close_probability}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {deals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {deals.length} deal{deals.length !== 1 ? 's' : ''} in final stages
          </p>
        </div>
      )}
    </Card>
  );
};
