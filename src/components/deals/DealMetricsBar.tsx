import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import { MyDeal } from '@/hooks/useMyDeals';

interface DealMetricsBarProps {
  totalDeals: number;
  filteredCount: number;
  deals: MyDeal[];
}

export const DealMetricsBar: React.FC<DealMetricsBarProps> = ({
  totalDeals,
  filteredCount,
  deals
}) => {
  const activeDeals = deals.filter(deal => deal.status === 'active').length;
  const draftDeals = deals.filter(deal => deal.status === 'draft').length;
  const archivedDeals = deals.filter(deal => deal.status === 'archived').length;
  
  const metrics = [
    {
      label: 'Total Deals',
      value: totalDeals,
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    },
    {
      label: 'Active',
      value: activeDeals,
      icon: TrendingUp,
      color: 'bg-green-500/10 text-green-600 border-green-500/20'
    },
    {
      label: 'Draft',
      value: draftDeals,
      icon: Clock,
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    },
    {
      label: 'Archived',
      value: archivedDeals,
      icon: CheckCircle,
      color: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className={`p-4 border ${metric.color}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-current/10">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold">
                  {metric.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};