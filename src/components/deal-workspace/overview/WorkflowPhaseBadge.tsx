import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  WorkflowPhase, 
  WORKFLOW_PHASE_LABELS, 
  WORKFLOW_PHASE_COLORS 
} from '@/hooks/useWorkflowPhase';
import { cn } from '@/lib/utils';

interface WorkflowPhaseBadgeProps {
  phase: WorkflowPhase | null;
  className?: string;
}

export const WorkflowPhaseBadge: React.FC<WorkflowPhaseBadgeProps> = ({ 
  phase,
  className 
}) => {
  if (!phase) {
    return (
      <Badge className={cn('bg-muted text-muted-foreground', className)}>
        Unknown
      </Badge>
    );
  }

  return (
    <Badge className={cn(WORKFLOW_PHASE_COLORS[phase], className)}>
      {WORKFLOW_PHASE_LABELS[phase]}
    </Badge>
  );
};

export default WorkflowPhaseBadge;
