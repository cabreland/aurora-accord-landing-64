import React, { useState } from 'react';
import { 
  FinancingApplication, 
  FinancingStage,
  FINANCING_STAGE_LABELS,
  FINANCING_STAGE_COLORS,
  FINANCING_TYPE_LABELS
} from '@/hooks/useFinancing';
import { ChevronDown, ChevronRight, Building2, DollarSign, Calendar, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface FinancingApplicationsByStageProps {
  applications: FinancingApplication[];
}

const STAGE_ORDER: FinancingStage[] = [
  'additional_docs_requested',
  'under_review',
  'conditional_approval',
  'application_submitted',
  'pre_qualification',
  'final_approval',
  'closing',
  'funded',
  'declined',
  'withdrawn'
];

export const FinancingApplicationsByStage: React.FC<FinancingApplicationsByStageProps> = ({ applications }) => {
  const navigate = useNavigate();
  const [expandedStages, setExpandedStages] = useState<Set<FinancingStage>>(
    new Set(['additional_docs_requested', 'under_review', 'conditional_approval'])
  );

  const toggleStage = (stage: FinancingStage) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage);
    } else {
      newExpanded.add(stage);
    }
    setExpandedStages(newExpanded);
  };

  // Group applications by stage
  const groupedApps = STAGE_ORDER.reduce((acc, stage) => {
    const stageApps = applications.filter(a => a.stage === stage);
    if (stageApps.length > 0) {
      acc[stage] = stageApps;
    }
    return acc;
  }, {} as Record<FinancingStage, FinancingApplication[]>);

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (applications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Financing Applications</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get started by creating a new financing application for a deal.
        </p>
        <Button onClick={() => navigate('/financing/new')} className="bg-[#D4AF37] hover:bg-[#B4941F] text-black">
          New Application
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(groupedApps).map(([stage, stageApps]) => {
        const isExpanded = expandedStages.has(stage as FinancingStage);
        const stageValue = stageApps.reduce((sum, a) => sum + (a.loan_amount || 0), 0);
        
        return (
          <div key={stage} className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Stage Header */}
            <button
              onClick={() => toggleStage(stage as FinancingStage)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${FINANCING_STAGE_COLORS[stage as FinancingStage]}`} />
                <span className="font-medium text-foreground">
                  {FINANCING_STAGE_LABELS[stage as FinancingStage]}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {stageApps.length}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(stageValue)}
                </span>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {/* Applications List */}
            {isExpanded && (
              <div className="border-t border-border">
                {stageApps.map((app, index) => (
                  <div 
                    key={app.id}
                    className={`flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors cursor-pointer ${
                      index < stageApps.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                    onClick={() => navigate(`/financing/${app.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Deal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {app.deal?.company_name || 'Unknown Deal'}
                          </span>
                          <Badge className={`text-xs ${getPriorityColor(app.priority)}`}>
                            {app.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{app.lender?.name || 'No lender'}</span>
                          <span>•</span>
                          <span>{FINANCING_TYPE_LABELS[app.financing_type]}</span>
                          {app.days_in_stage > 0 && (
                            <>
                              <span>•</span>
                              <span>{app.days_in_stage}d in stage</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Loan Amount */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-foreground font-medium">
                          <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                          {formatCurrency(app.loan_amount)}
                        </div>
                        {app.interest_rate && (
                          <div className="text-xs text-muted-foreground">
                            {app.interest_rate}% rate
                          </div>
                        )}
                      </div>
                      
                      {/* Health Score */}
                      <div className="flex-shrink-0 w-16 text-right">
                        <div className={`text-sm font-medium ${
                          app.health_score >= 80 ? 'text-emerald-400' :
                          app.health_score >= 60 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {app.health_score}%
                        </div>
                        <div className="text-xs text-muted-foreground">health</div>
                      </div>
                      
                      {/* Action */}
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
