import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Check, 
  Clock, 
  Lock, 
  Circle,
  ChevronDown,
  ChevronUp,
  History,
  Settings,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Milestone {
  phase: string;
  timestamp: string | null;
}

interface PhaseDefinition {
  value: string;
  label: string;
  description: string;
  side: 'sell' | 'buy';
  requirements?: string[];
}

const PHASES: PhaseDefinition[] = [
  { 
    value: 'listing_received', 
    label: 'Listing Received', 
    description: 'Deal created and initial information gathered',
    side: 'sell'
  },
  { 
    value: 'under_review', 
    label: 'Under Review', 
    description: 'Submitted for admin approval',
    side: 'sell',
    requirements: ['80%+ data room completion', 'Team assigned']
  },
  { 
    value: 'listing_approved', 
    label: 'Listing Approved', 
    description: 'Approved by admin, ready for data room build',
    side: 'sell'
  },
  { 
    value: 'data_room_build', 
    label: 'Data Room Build', 
    description: 'Upload documents to all required folders',
    side: 'sell',
    requirements: ['All required folders have documents']
  },
  { 
    value: 'qa_compliance', 
    label: 'QA Compliance', 
    description: 'Quality assurance and compliance review',
    side: 'sell',
    requirements: ['100% data room completion']
  },
  { 
    value: 'ready_for_distribution', 
    label: 'Ready for Distribution', 
    description: 'All preparation complete, ready to publish',
    side: 'sell'
  },
  { 
    value: 'live_active', 
    label: 'Live Active', 
    description: 'Deal visible to investors',
    side: 'buy'
  },
  { 
    value: 'under_loi', 
    label: 'Under LOI', 
    description: 'Letter of Intent received from buyer',
    side: 'buy'
  },
  { 
    value: 'due_diligence', 
    label: 'Due Diligence', 
    description: 'Buyer performing detailed due diligence',
    side: 'buy'
  },
  { 
    value: 'closing', 
    label: 'Closing', 
    description: 'Deal in final closing process',
    side: 'buy'
  },
  { 
    value: 'closed', 
    label: 'Closed', 
    description: 'Deal successfully completed',
    side: 'buy'
  },
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
  const [isExpanded, setIsExpanded] = useState(true);

  const sellSidePhases = PHASES.filter(p => p.side === 'sell');
  const buySidePhases = PHASES.filter(p => p.side === 'buy');

  const currentPhaseIndex = PHASES.findIndex(p => p.value === currentPhase);
  const sellSideComplete = currentPhaseIndex >= sellSidePhases.length;
  const sellSideProgress = sellSideComplete 
    ? 100 
    : Math.round((currentPhaseIndex / sellSidePhases.length) * 100);

  const buySideProgress = sellSideComplete
    ? Math.round(((currentPhaseIndex - sellSidePhases.length) / buySidePhases.length) * 100)
    : 0;

  const getPhaseStatus = (phase: PhaseDefinition) => {
    const phaseIndex = PHASES.findIndex(p => p.value === phase.value);
    if (phaseIndex < currentPhaseIndex) return 'complete';
    if (phaseIndex === currentPhaseIndex) return 'active';
    
    // Check if blocked
    if (phase.requirements && phase.requirements.length > 0) {
      if (phase.value === 'data_room_build' && healthPercentage < 100) return 'blocked';
      if (phase.value === 'qa_compliance' && healthPercentage < 100) return 'blocked';
    }
    
    return 'pending';
  };

  const PhaseStep = ({ phase }: { phase: PhaseDefinition }) => {
    const status = getPhaseStatus(phase);
    const timestamp = milestones[phase.value];

    return (
      <div className={cn(
        "flex items-start gap-4 p-4 rounded-lg transition-colors",
        status === 'complete' && "bg-green-50 dark:bg-green-950/30",
        status === 'active' && "bg-primary/10 border border-primary/30",
        status === 'blocked' && "bg-muted/50 opacity-60"
      )}>
        {/* Status Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          status === 'complete' && "bg-green-500 text-white",
          status === 'active' && "bg-primary text-primary-foreground",
          status === 'pending' && "bg-muted text-muted-foreground border-2 border-muted-foreground/30",
          status === 'blocked' && "bg-muted text-muted-foreground"
        )}>
          {status === 'complete' && <Check className="h-4 w-4" />}
          {status === 'active' && <Clock className="h-4 w-4" />}
          {status === 'pending' && <Circle className="h-4 w-4" />}
          {status === 'blocked' && <Lock className="h-4 w-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn(
              "font-medium",
              status === 'active' && "text-primary"
            )}>
              {phase.label}
            </h4>
            {timestamp && (
              <span className="text-sm text-muted-foreground">
                {format(new Date(timestamp), 'MMM d, yyyy h:mm a')}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-0.5">{phase.description}</p>

          {/* Requirements */}
          {phase.requirements && status !== 'complete' && (
            <div className="mt-2 text-sm">
              <ul className="space-y-1">
                {phase.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action button for active phase */}
          {status === 'active' && phase.value === 'data_room_build' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => onJumpToTab('data-room')}
            >
              Go to Data Room
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deal Pipeline Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {Math.round((currentPhaseIndex / (PHASES.length - 1)) * 100)}% Complete
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Sell-Side Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Sell-Side Preparation
              </h3>
              <span className="text-sm text-muted-foreground">
                {sellSideProgress}% Complete
              </span>
            </div>
            <Progress value={sellSideProgress} className="h-2 mb-4" />
            
            <div className="space-y-2">
              {sellSidePhases.map(phase => (
                <PhaseStep key={phase.value} phase={phase} />
              ))}
            </div>
          </div>

          {/* Buy-Side Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Buy-Side Active
              </h3>
              <span className="text-sm text-muted-foreground">
                {sellSideComplete ? `${buySideProgress}% Complete` : 'Not Started'}
              </span>
            </div>
            <Progress value={buySideProgress} className="h-2 mb-4" />
            
            <div className="space-y-2">
              {buySidePhases.map(phase => (
                <PhaseStep key={phase.value} phase={phase} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onViewHistory}>
              <History className="mr-2 h-4 w-4" />
              View Full History
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
