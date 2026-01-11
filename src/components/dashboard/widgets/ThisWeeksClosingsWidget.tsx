import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, DollarSign, ChevronRight } from 'lucide-react';
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
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-success/10 text-success border-success/20';
    if (probability >= 50) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
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
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Closing Soon</h3>
            <p className="text-xs text-muted-foreground">Final stages</p>
          </div>
        </div>
      </div>

      {/* Total Projected Value */}
      <div className="mb-4 p-3 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs text-muted-foreground">Probability-Weighted Value</span>
        </div>
        <p className="text-2xl font-bold text-[#D4AF37]">
          {formatCurrency(totalPipelineValue)}
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground text-sm">No deals in final stages</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              to={`/deal/${deal.id}`}
              className="block"
            >
              <div className="p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {deal.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {deal.asking_price || 'Price TBD'}
                      </span>
                      <Badge className={`text-xs ${getProbabilityColor(deal.close_probability)}`}>
                        {deal.close_probability}% likely
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
