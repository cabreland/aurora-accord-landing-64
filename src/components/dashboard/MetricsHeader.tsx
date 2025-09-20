import React from 'react';
import { BarChart3, TrendingUp, Building2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { usePipelineStats } from '@/hooks/usePipelineStats';
import { useNDAStats } from '@/hooks/useNDAStats';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend: 'up' | 'down' | 'neutral';
}

const MetricCard = ({ title, value, change, icon: Icon, trend }: MetricCardProps) => {
  const trendColors = {
    up: 'text-[#22C55E]',
    down: 'text-[#EF4444]',
    neutral: 'text-[#F4E4BC]'
  };

  return (
    <Card className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 hover:border-[#D4AF37]/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Icon className="w-6 h-6 text-[#D4AF37]" />
          <span className={`text-xs font-medium ${trendColors[trend]}`}>
            {change}
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#FAFAFA] mb-1">{value}</div>
          <p className="text-xs text-[#F4E4BC]/60">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricsHeader: React.FC = () => {
  const { metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { totalValue, totalDeals, loading: pipelineLoading } = usePipelineStats();
  const { stats: ndaStats, loading: ndaLoading } = useNDAStats();

  const formatValue = (value: number): string => {
    if (value === 0) return '0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const isLoading = metricsLoading || pipelineLoading || ndaLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="w-6 h-6" />
                <Skeleton className="w-12 h-4" />
              </div>
              <Skeleton className="w-16 h-8 mb-1" />
              <Skeleton className="w-20 h-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <MetricCard
        title="Pipeline Value"
        value={formatValue(totalValue)}
        change="+8.2%"
        icon={TrendingUp}
        trend="up"
      />
      <MetricCard
        title="Active Deals"
        value={metrics.activeDeals.toString()}
        change={totalDeals > metrics.activeDeals ? `+${totalDeals - metrics.activeDeals}` : "0"}
        icon={Building2}
        trend="up"
      />
      <MetricCard
        title="NDAs Pending"
        value={ndaStats.pending.toString()}
        change={ndaStats.approved > 0 ? `${ndaStats.approved} approved` : "0"}
        icon={AlertTriangle}
        trend="neutral"
      />
      <MetricCard
        title="Closing This Month"
        value={Math.ceil(metrics.activeDeals * 0.3).toString()}
        change="+1"
        icon={BarChart3}
        trend="up"
      />
    </div>
  );
};