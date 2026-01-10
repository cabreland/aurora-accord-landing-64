import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Circle, User, Zap } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { StageHistoryEntry, DealStage, STAGE_LABELS, TRIGGER_LABELS } from '@/hooks/useDealStageManager';

interface StageHistoryCardProps {
  history: StageHistoryEntry[];
  currentStage: DealStage;
}

export const StageHistoryCard: React.FC<StageHistoryCardProps> = ({
  history,
  currentStage
}) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Stage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No stage history recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Stage History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.slice(0, 5).map((entry, index) => {
          const isActive = entry.stage === currentStage && !entry.exited_at;
          const stageLabel = STAGE_LABELS[entry.stage as DealStage] || entry.stage;
          const triggerLabel = entry.trigger_event 
            ? TRIGGER_LABELS[entry.trigger_event] || entry.trigger_event 
            : null;

          return (
            <div
              key={entry.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg transition-colors',
                isActive ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full mt-0.5',
                isActive ? 'bg-primary/20' : 'bg-muted'
              )}>
                {isActive ? (
                  <Circle className="w-4 h-4 text-primary fill-primary" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{stageLabel}</span>
                  {isActive && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                  {entry.triggered_by === 'auto' && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>
                    Entered {formatDistanceToNow(new Date(entry.entered_at), { addSuffix: true })}
                  </span>
                  {entry.duration_days !== null && (
                    <>
                      <span>•</span>
                      <span>{entry.duration_days} day{entry.duration_days !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>

                {triggerLabel && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Triggered by: {triggerLabel}
                  </p>
                )}
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(entry.entered_at), 'MMM d, yyyy')}
              </span>
            </div>
          );
        })}

        {history.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            +{history.length - 5} more entries
          </p>
        )}
      </CardContent>
    </Card>
  );
};
