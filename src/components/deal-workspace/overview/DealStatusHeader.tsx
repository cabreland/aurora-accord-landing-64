import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  Flame,
  User,
  Calendar,
  MoreVertical,
  Send,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// Workflow phases with metadata
const WORKFLOW_PHASES = [
  { value: 'listing_received', label: 'Listing Received', icon: FileText, side: 'sell' },
  { value: 'under_review', label: 'Under Review', icon: Clock, side: 'sell' },
  { value: 'listing_approved', label: 'Listing Approved', icon: CheckCircle2, side: 'sell' },
  { value: 'data_room_build', label: 'Data Room Build', icon: FileText, side: 'sell' },
  { value: 'qa_compliance', label: 'QA Compliance', icon: AlertCircle, side: 'sell' },
  { value: 'ready_for_distribution', label: 'Ready for Distribution', icon: CheckCircle2, side: 'sell' },
  { value: 'live_active', label: 'Live Active', icon: CheckCircle2, side: 'buy' },
  { value: 'under_loi', label: 'Under LOI', icon: FileText, side: 'buy' },
  { value: 'due_diligence', label: 'Due Diligence', icon: Clock, side: 'buy' },
  { value: 'closing', label: 'Closing', icon: Clock, side: 'buy' },
  { value: 'closed', label: 'Closed', icon: CheckCircle2, side: 'buy' },
] as const;

interface DealStatusHeaderProps {
  deal: {
    id: string;
    company_name: string;
    industry?: string | null;
    priority: string;
    created_at: string;
    status: string;
  };
  currentPhase: string | null;
  healthPercentage: number;
  ownerName?: string;
  canSubmitForReview: boolean;
  onSubmitForReview: () => void;
  onSettingsClick: () => void;
}

export const DealStatusHeader: React.FC<DealStatusHeaderProps> = ({
  deal,
  currentPhase,
  healthPercentage,
  ownerName = 'Unknown',
  canSubmitForReview,
  onSubmitForReview,
  onSettingsClick,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const phaseInfo = WORKFLOW_PHASES.find(p => p.value === currentPhase) || WORKFLOW_PHASES[0];
  const PhaseIcon = phaseInfo.icon;

  const getHealthVariant = (pct: number) => {
    if (pct >= 80) return 'default';
    if (pct >= 50) return 'secondary';
    return 'destructive';
  };

  const getHealthLabel = (pct: number) => {
    if (pct >= 80) return 'Healthy';
    if (pct >= 50) return 'Needs Attention';
    return 'Critical';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <Flame className="h-4 w-4 text-orange-500" />;
    return null;
  };

  const handlePhaseChange = async (newPhase: typeof WORKFLOW_PHASES[number]['value']) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('deals')
        .update({ 
          workflow_phase: newPhase,
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id);

      if (error) throw error;

      // Log the activity
      await supabase.from('deal_activities').insert({
        deal_id: deal.id,
        activity_type: 'deal_updated',
        entity_type: 'deal',
        entity_id: deal.id,
        metadata: { 
          action: 'phase_changed',
          from_phase: currentPhase,
          to_phase: newPhase 
        }
      });

      queryClient.invalidateQueries({ queryKey: ['deal', deal.id] });
      queryClient.invalidateQueries({ queryKey: ['workflow-phase', deal.id] });

      toast({
        title: 'Phase Updated',
        description: `Deal moved to ${WORKFLOW_PHASES.find(p => p.value === newPhase)?.label}`,
      });
    } catch (error) {
      console.error('Error updating phase:', error);
      toast({
        title: 'Error',
        description: 'Failed to update phase',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Left: Status Info */}
          <div className="space-y-3">
            {/* Phase and Health Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5 px-3 py-1">
                <PhaseIcon className="h-3.5 w-3.5" />
                {phaseInfo.label}
              </Badge>
              <Badge variant={getHealthVariant(healthPercentage)} className="gap-1.5 px-3 py-1">
                {healthPercentage >= 80 ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : healthPercentage >= 50 ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                {healthPercentage}% {getHealthLabel(healthPercentage)}
              </Badge>
              {deal.priority === 'high' && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1 border-orange-300 bg-orange-50 text-orange-700">
                  <Flame className="h-3.5 w-3.5" />
                  High Priority
                </Badge>
              )}
            </div>

            {/* Deal Name */}
            <h2 className="text-2xl font-bold text-foreground">{deal.company_name}</h2>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {deal.industry && (
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {deal.industry}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Owner: {ownerName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Created {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {canSubmitForReview && currentPhase === 'listing_received' && (
              <Button onClick={onSubmitForReview} className="gap-2">
                <Send className="h-4 w-4" />
                Submit for Review
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isUpdating} className="gap-2">
                  Change Phase
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Sell-Side
                </div>
                {WORKFLOW_PHASES.filter(p => p.side === 'sell').map(phase => (
                  <DropdownMenuItem
                    key={phase.value}
                    onClick={() => handlePhaseChange(phase.value)}
                    className={cn(
                      'gap-2',
                      currentPhase === phase.value && 'bg-muted'
                    )}
                  >
                    <phase.icon className="h-4 w-4" />
                    {phase.label}
                    {currentPhase === phase.value && (
                      <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Buy-Side
                </div>
                {WORKFLOW_PHASES.filter(p => p.side === 'buy').map(phase => (
                  <DropdownMenuItem
                    key={phase.value}
                    onClick={() => handlePhaseChange(phase.value)}
                    className={cn(
                      'gap-2',
                      currentPhase === phase.value && 'bg-muted'
                    )}
                  >
                    <phase.icon className="h-4 w-4" />
                    {phase.label}
                    {currentPhase === phase.value && (
                      <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon" onClick={onSettingsClick}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
