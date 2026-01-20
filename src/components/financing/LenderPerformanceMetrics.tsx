import React from 'react';
import { FinancingApplication, Lender } from '@/hooks/useFinancing';
import { Building2, TrendingUp, Clock, CheckCircle2, XCircle, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LenderPerformanceMetricsProps {
  applications: FinancingApplication[];
  lenders: Lender[];
}

interface LenderStats {
  lender: Lender;
  totalApps: number;
  funded: number;
  declined: number;
  active: number;
  totalValue: number;
  fundedValue: number;
  avgDaysToFund: number;
  successRate: number;
}

export const LenderPerformanceMetrics: React.FC<LenderPerformanceMetricsProps> = ({ 
  applications, 
  lenders 
}) => {
  // Calculate stats per lender
  const lenderStats: LenderStats[] = lenders
    .map(lender => {
      const lenderApps = applications.filter(a => a.lender_id === lender.id);
      const funded = lenderApps.filter(a => a.stage === 'funded');
      const declined = lenderApps.filter(a => a.stage === 'declined' || a.stage === 'withdrawn');
      const active = lenderApps.filter(a => !['funded', 'declined', 'withdrawn'].includes(a.stage));
      
      const totalValue = lenderApps.reduce((sum, a) => sum + (a.loan_amount || 0), 0);
      const fundedValue = funded.reduce((sum, a) => sum + (a.loan_amount || 0), 0);
      
      // Calculate average days to fund
      const fundedWithDays = funded.filter(a => a.submitted_at && a.funded_at);
      const avgDaysToFund = fundedWithDays.length > 0
        ? Math.round(fundedWithDays.reduce((sum, a) => {
            const submitted = new Date(a.submitted_at!);
            const fundedDate = new Date(a.funded_at!);
            return sum + Math.ceil((fundedDate.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / fundedWithDays.length)
        : lender.avg_close_days || 0;
      
      const completedApps = funded.length + declined.length;
      const successRate = completedApps > 0 
        ? Math.round((funded.length / completedApps) * 100)
        : lender.success_rate || 0;
      
      return {
        lender,
        totalApps: lenderApps.length,
        funded: funded.length,
        declined: declined.length,
        active: active.length,
        totalValue,
        fundedValue,
        avgDaysToFund,
        successRate
      };
    })
    .filter(stats => stats.totalApps > 0)
    .sort((a, b) => b.fundedValue - a.fundedValue);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (lenderStats.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Lender Performance</h3>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No lender data available</p>
          <p className="text-xs mt-1">Stats will appear once applications are submitted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-[#D4AF37]" />
        <h3 className="font-medium text-foreground">Lender Performance</h3>
      </div>
      
      <div className="space-y-4">
        {lenderStats.slice(0, 5).map((stats) => (
          <div 
            key={stats.lender.id}
            className="p-4 rounded-lg border border-border bg-secondary/30 hover:border-[#D4AF37]/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{stats.lender.name}</span>
                {stats.lender.is_preferred && (
                  <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                )}
              </div>
              <span className="text-xs text-muted-foreground capitalize">
                {stats.lender.type?.replace('_', ' ')}
              </span>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-sm font-medium text-blue-400">{stats.active}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Funded</p>
                <p className="text-sm font-medium text-emerald-400">{stats.funded}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Days</p>
                <p className="text-sm font-medium text-foreground">{stats.avgDaysToFund || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="text-sm font-medium text-[#D4AF37]">{formatCurrency(stats.fundedValue)}</p>
              </div>
            </div>
            
            {/* Success Rate Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20">Success Rate</span>
              <div className="flex-1">
                <Progress 
                  value={stats.successRate} 
                  className="h-2 bg-muted"
                />
              </div>
              <span className={`text-sm font-medium ${
                stats.successRate >= 80 ? 'text-emerald-400' :
                stats.successRate >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {stats.successRate}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
