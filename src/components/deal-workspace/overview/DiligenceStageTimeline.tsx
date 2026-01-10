import React from 'react';
import { Check, Circle, CircleDot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type DiligenceStage = 'initiated' | 'information_request' | 'analysis' | 'final_review' | 'closing';

interface Stage {
  id: DiligenceStage;
  label: string;
  description: string;
}

const STAGES: Stage[] = [
  { id: 'initiated', label: 'Deal Initiated', description: 'Deal created and team assigned' },
  { id: 'information_request', label: 'Information Request', description: 'Gathering documents and data' },
  { id: 'analysis', label: 'Analysis', description: 'Review and due diligence' },
  { id: 'final_review', label: 'Final Review', description: 'Executive sign-off' },
  { id: 'closing', label: 'Closing', description: 'Transaction completion' },
];

interface DiligenceStageTimelineProps {
  currentStage: DiligenceStage;
  completedStages: DiligenceStage[];
  daysInCurrentStage?: number;
  expectedCompletionDates?: Partial<Record<DiligenceStage, string>>;
}

export const DiligenceStageTimeline: React.FC<DiligenceStageTimelineProps> = ({
  currentStage,
  completedStages,
  daysInCurrentStage = 0,
  expectedCompletionDates = {},
}) => {
  const getStageStatus = (stageId: DiligenceStage): 'completed' | 'active' | 'upcoming' => {
    if (completedStages.includes(stageId)) return 'completed';
    if (stageId === currentStage) return 'active';
    return 'upcoming';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <span>Due Diligence Progress</span>
          {daysInCurrentStage > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {daysInCurrentStage} day{daysInCurrentStage !== 1 ? 's' : ''} in current stage
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ 
                width: `${((completedStages.length + (currentStage ? 0.5 : 0)) / STAGES.length) * 100}%` 
              }}
            />
          </div>
          
          {/* Stages */}
          <div className="relative flex justify-between">
          {STAGES.map((stage) => {
              const status = getStageStatus(stage.id);
              
              return (
                <div
                  key={stage.id}
                  className="flex flex-col items-center text-center"
                >
                  {/* Stage indicator */}
                  <div
                    className={cn(
                      'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                      status === 'completed' && 'bg-primary border-primary',
                      status === 'active' && 'bg-background border-primary ring-4 ring-primary/20',
                      status === 'upcoming' && 'bg-background border-muted'
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="h-5 w-5 text-primary-foreground" />
                    ) : status === 'active' ? (
                      <CircleDot className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Stage label */}
                  <div className="mt-3 max-w-[100px] md:max-w-[120px]">
                    <p className={cn(
                      'text-xs font-medium',
                      status === 'completed' && 'text-primary',
                      status === 'active' && 'text-foreground',
                      status === 'upcoming' && 'text-muted-foreground'
                    )}>
                      {stage.label}
                    </p>
                    {expectedCompletionDates[stage.id] && status !== 'completed' && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {expectedCompletionDates[stage.id]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
