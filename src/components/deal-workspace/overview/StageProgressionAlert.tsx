import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DealStage, STAGE_LABELS, TRIGGER_LABELS } from '@/hooks/useDealStageManager';

interface StageProgressionAlertProps {
  currentStage: DealStage;
  suggestedStage: DealStage;
  triggerEvent: string | null;
  onAccept: () => void;
  onDismiss: () => void;
  isProgressing?: boolean;
}

export const StageProgressionAlert: React.FC<StageProgressionAlertProps> = ({
  currentStage,
  suggestedStage,
  triggerEvent,
  onAccept,
  onDismiss,
  isProgressing = false
}) => {
  const triggerLabel = triggerEvent ? TRIGGER_LABELS[triggerEvent] || triggerEvent : 'Conditions met';

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {triggerLabel}!
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                <span>Deal ready to progress:</span>
                <span className="font-medium text-foreground">
                  {STAGE_LABELS[currentStage]}
                </span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-medium text-primary">
                  {STAGE_LABELS[suggestedStage]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="text-muted-foreground"
              disabled={isProgressing}
            >
              <X className="w-4 h-4 mr-1" />
              Keep Current
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              disabled={isProgressing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProgressing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Progressing...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Progress Now
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
