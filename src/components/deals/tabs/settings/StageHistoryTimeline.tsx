import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Circle, Zap, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StageHistoryEntry, DealStage, STAGE_LABELS, TRIGGER_LABELS } from '@/hooks/useDealStageManager';

interface StageHistoryTimelineProps {
  history: StageHistoryEntry[];
  currentStage: DealStage;
}

export const StageHistoryTimeline: React.FC<StageHistoryTimelineProps> = ({
  history,
  currentStage
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No stage history recorded yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Stage changes will appear here as the deal progresses
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-border" />

      <div className="space-y-4">
        {history.map((entry, index) => {
          const isActive = entry.stage === currentStage && !entry.exited_at;
          const stageLabel = STAGE_LABELS[entry.stage as DealStage] || entry.stage;
          const triggerLabel = entry.trigger_event 
            ? TRIGGER_LABELS[entry.trigger_event] || entry.trigger_event 
            : null;

          return (
            <div key={entry.id} className="relative flex gap-4 pl-1">
              {/* Timeline dot */}
              <div className={cn(
                "relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background border-2 border-primary/30"
              )}>
                {isActive ? (
                  <Circle className="w-3 h-3 fill-current" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-primary/50" />
                )}
              </div>

              {/* Content */}
              <div className={cn(
                "flex-1 pb-4 -mt-0.5",
                index === history.length - 1 && "pb-0"
              )}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{stageLabel}</span>
                  {isActive && (
                    <Badge className="text-xs h-5">Current</Badge>
                  )}
                  {entry.triggered_by === 'auto' && (
                    <Badge variant="secondary" className="text-xs h-5 gap-0.5">
                      <Zap className="w-2.5 h-2.5" />
                      Auto
                    </Badge>
                  )}
                  {entry.triggered_by === 'manual' && (
                    <Badge variant="outline" className="text-xs h-5 gap-0.5">
                      <User className="w-2.5 h-2.5" />
                      Manual
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                  <span>{format(new Date(entry.entered_at), 'MMM d, yyyy · h:mm a')}</span>
                  {entry.duration_days !== null && entry.duration_days > 0 && (
                    <>
                      <span className="text-border">•</span>
                      <span className="font-medium">
                        {entry.duration_days} day{entry.duration_days !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                  {isActive && (
                    <>
                      <span className="text-border">•</span>
                      <span className="text-primary font-medium">
                        {formatDistanceToNow(new Date(entry.entered_at))} in stage
                      </span>
                    </>
                  )}
                </div>

                {triggerLabel && (
                  <p className="text-xs text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                    <span className="text-muted-foreground/60">Triggered by:</span>
                    <span>{triggerLabel}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageHistoryTimeline;
