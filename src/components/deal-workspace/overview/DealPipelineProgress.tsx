import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Check,
  Clock,
  Circle,
  ChevronDown,
  ChevronRight,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// 5 macro phases, each wrapping micro-phases
const MACRO_PHASES = [
  {
    id: 'intake',
    label: 'Intake',
    color: 'from-blue-500 to-blue-600',
    phases: ['listing_received', 'under_review', 'listing_approved'],
  },
  {
    id: 'preparation',
    label: 'Preparation',
    color: 'from-violet-500 to-violet-600',
    phases: ['data_room_build', 'qa_compliance', 'ready_for_distribution'],
  },
  {
    id: 'live',
    label: 'Live',
    color: 'from-emerald-500 to-emerald-600',
    phases: ['live_active'],
  },
  {
    id: 'offer',
    label: 'Offer',
    color: 'from-amber-500 to-amber-600',
    phases: ['under_loi', 'due_diligence'],
  },
  {
    id: 'closed',
    label: 'Closed',
    color: 'from-slate-500 to-slate-600',
    phases: ['closing', 'closed'],
  },
];

const PHASE_LABELS: Record<string, string> = {
  listing_received: 'Listing Received',
  under_review: 'Under Review',
  listing_approved: 'Listing Approved',
  data_room_build: 'Data Room Build',
  qa_compliance: 'QA & Compliance',
  ready_for_distribution: 'Ready for Distribution',
  live_active: 'Live & Active',
  under_loi: 'Under LOI',
  due_diligence: 'Due Diligence',
  closing: 'Closing',
  closed: 'Closed',
};

const PHASE_ORDER = [
  'listing_received', 'under_review', 'listing_approved',
  'data_room_build', 'qa_compliance', 'ready_for_distribution',
  'live_active', 'under_loi', 'due_diligence', 'closing', 'closed',
];

interface DealPipelineProgressProps {
  currentPhase: string | null;
  milestones: Record<string, string | null>;
  healthPercentage: number;
  onJumpToTab: (tab: string) => void;
  onViewHistory: () => void;
}

export const DealPipelineProgress: React.FC<DealPipelineProgressProps> = ({
  currentPhase,
  milestones,
  healthPercentage,
  onJumpToTab,
  onViewHistory,
}) => {
  const [expandedMacro, setExpandedMacro] = useState<string | null>(null);

  const currentPhaseIndex = PHASE_ORDER.indexOf(currentPhase || 'listing_received');
  const overallPct = Math.round(((currentPhaseIndex + 1) / PHASE_ORDER.length) * 100);

  const getMacroStatus = (macro: typeof MACRO_PHASES[0]) => {
    const lastPhase = macro.phases[macro.phases.length - 1];
    const firstPhase = macro.phases[0];
    const lastIdx = PHASE_ORDER.indexOf(lastPhase);
    const firstIdx = PHASE_ORDER.indexOf(firstPhase);

    if (lastIdx < currentPhaseIndex) return 'complete';
    if (firstIdx <= currentPhaseIndex) return 'active';
    return 'pending';
  };

  const getPhaseStatus = (phase: string) => {
    const idx = PHASE_ORDER.indexOf(phase);
    if (idx < currentPhaseIndex) return 'complete';
    if (idx === currentPhaseIndex) return 'active';
    return 'pending';
  };

  // Auto-expand the active macro phase
  const activeMacro = MACRO_PHASES.find(m => {
    const firstIdx = PHASE_ORDER.indexOf(m.phases[0]);
    const lastIdx = PHASE_ORDER.indexOf(m.phases[m.phases.length - 1]);
    return firstIdx <= currentPhaseIndex && currentPhaseIndex <= lastIdx;
  });

  const toggleMacro = (macroId: string) => {
    setExpandedMacro(prev => prev === macroId ? null : macroId);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deal Pipeline
          </CardTitle>
          <Badge variant="outline" className="font-mono text-sm">
            {overallPct}% Complete
          </Badge>
        </div>

        {/* Overall progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Horizontal stepper */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {MACRO_PHASES.map((macro, i) => {
            const status = getMacroStatus(macro);
            const isExpanded = expandedMacro === macro.id || activeMacro?.id === macro.id;

            return (
              <React.Fragment key={macro.id}>
                <button
                  onClick={() => toggleMacro(macro.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                    status === 'complete' && 'bg-success/10 text-success',
                    status === 'active' && 'bg-primary/10 text-primary ring-1 ring-primary/30',
                    status === 'pending' && 'bg-muted text-muted-foreground',
                  )}
                >
                  {status === 'complete' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : status === 'active' ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  {macro.label}
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  ) : (
                    <ChevronRight className="h-3 w-3 ml-0.5" />
                  )}
                </button>
                {i < MACRO_PHASES.length - 1 && (
                  <div className={cn(
                    'h-px flex-1 min-w-[16px]',
                    MACRO_PHASES.slice(0, i + 1).every(m => getMacroStatus(m) === 'complete')
                      ? 'bg-success'
                      : 'bg-border'
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Expanded micro-phases for active/selected macro */}
        {MACRO_PHASES.map((macro) => {
          const isExpanded = expandedMacro === macro.id || activeMacro?.id === macro.id;
          if (!isExpanded) return null;

          return (
            <div key={`${macro.id}-steps`} className="bg-muted/30 rounded-lg p-3 space-y-2 border border-border">
              {macro.phases.map((phase) => {
                const status = getPhaseStatus(phase);
                const timestamp = milestones[phase];

                return (
                  <div key={phase} className={cn(
                    'flex items-center gap-3 py-2 px-3 rounded-md',
                    status === 'complete' && 'bg-success/5',
                    status === 'active' && 'bg-primary/5 ring-1 ring-primary/20',
                  )}>
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                      status === 'complete' && 'bg-success text-success-foreground',
                      status === 'active' && 'bg-primary text-primary-foreground',
                      status === 'pending' && 'bg-muted text-muted-foreground border border-border',
                    )}>
                      {status === 'complete' && <Check className="h-3 w-3" />}
                      {status === 'active' && <Clock className="h-3 w-3" />}
                      {status === 'pending' && <Circle className="h-3 w-3" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        status === 'active' && 'text-primary',
                        status === 'complete' && 'text-foreground',
                        status === 'pending' && 'text-muted-foreground',
                      )}>
                        {PHASE_LABELS[phase]}
                      </p>
                    </div>

                    {timestamp && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(timestamp), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Footer */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onViewHistory} className="text-xs">
            <History className="mr-1.5 h-3.5 w-3.5" />
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
