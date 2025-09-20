import React from 'react';
import { BarChart3, TrendingUp, Building2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <MetricCard
        title="Pipeline Value"
        value="$12.5M"
        change="+8.2%"
        icon={TrendingUp}
        trend="up"
      />
      <MetricCard
        title="Active Deals"
        value="23"
        change="+3"
        icon={Building2}
        trend="up"
      />
      <MetricCard
        title="NDAs Pending"
        value="7"
        change="-2"
        icon={AlertTriangle}
        trend="neutral"
      />
      <MetricCard
        title="Closing This Month"
        value="4"
        change="+1"
        icon={BarChart3}
        trend="up"
      />
    </div>
  );
};