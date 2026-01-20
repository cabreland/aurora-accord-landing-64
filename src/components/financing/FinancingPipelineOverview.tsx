import React from 'react';
import { 
  FinancingApplication, 
  FinancingStage, 
  FINANCING_STAGE_LABELS,
  FINANCING_STAGE_COLORS 
} from '@/hooks/useFinancing';
import { DollarSign, TrendingUp, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FinancingPipelineOverviewProps {
  applications: FinancingApplication[];
}

const ACTIVE_STAGES: FinancingStage[] = [
  'pre_qualification',
  'application_submitted',
  'under_review',
  'additional_docs_requested',
  'conditional_approval',
  'final_approval',
  'closing'
];

export const FinancingPipelineOverview: React.FC<FinancingPipelineOverviewProps> = ({ applications }) => {
  // Calculate pipeline stats
  const activeApps = applications.filter(a => ACTIVE_STAGES.includes(a.stage));
  const fundedApps = applications.filter(a => a.stage === 'funded');
  const declinedApps = applications.filter(a => a.stage === 'declined' || a.stage === 'withdrawn');
  
  const totalPipelineValue = activeApps.reduce((sum, a) => sum + (a.loan_amount || 0), 0);
  const fundedValue = fundedApps.reduce((sum, a) => sum + (a.loan_amount || 0), 0);
  
  const avgDaysInStage = activeApps.length > 0 
    ? Math.round(activeApps.reduce((sum, a) => sum + a.days_in_stage, 0) / activeApps.length)
    : 0;
  
  const avgHealthScore = activeApps.length > 0
    ? Math.round(activeApps.reduce((sum, a) => sum + a.health_score, 0) / activeApps.length)
    : 100;

  // Count by stage
  const stageCounts = ACTIVE_STAGES.reduce((acc, stage) => {
    acc[stage] = applications.filter(a => a.stage === stage).length;
    return acc;
  }, {} as Record<FinancingStage, number>);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const stats = [
    {
      label: 'Active Pipeline',
      value: formatCurrency(totalPipelineValue),
      subtext: `${activeApps.length} applications`,
      icon: DollarSign,
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10'
    },
    {
      label: 'Funded YTD',
      value: formatCurrency(fundedValue),
      subtext: `${fundedApps.length} deals closed`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      label: 'Avg. Days in Stage',
      value: avgDaysInStage.toString(),
      subtext: 'days',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Pipeline Health',
      value: `${avgHealthScore}%`,
      subtext: avgHealthScore >= 80 ? 'Healthy' : avgHealthScore >= 60 ? 'Attention needed' : 'At risk',
      icon: avgHealthScore >= 80 ? TrendingUp : AlertTriangle,
      color: avgHealthScore >= 80 ? 'text-emerald-400' : avgHealthScore >= 60 ? 'text-yellow-400' : 'text-red-400',
      bgColor: avgHealthScore >= 80 ? 'bg-emerald-500/10' : avgHealthScore >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 hover:border-[#D4AF37]/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Stages */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Pipeline by Stage</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {ACTIVE_STAGES.map((stage, index) => {
            const count = stageCounts[stage];
            const hasApps = count > 0;
            
            return (
              <React.Fragment key={stage}>
                <div 
                  className={`flex-1 min-w-[100px] p-3 rounded-lg border transition-all ${
                    hasApps 
                      ? 'border-border bg-secondary/50 hover:border-[#D4AF37]/30' 
                      : 'border-border/50 bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${FINANCING_STAGE_COLORS[stage]}`} />
                    <span className={`text-xs font-medium truncate ${hasApps ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {FINANCING_STAGE_LABELS[stage]}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${hasApps ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                    {count}
                  </p>
                </div>
                {index < ACTIVE_STAGES.length - 1 && (
                  <div className="w-4 h-0.5 bg-border flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
