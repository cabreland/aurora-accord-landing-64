import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { PipelineHealth } from '@/hooks/useMissionControl';

interface PipelineHealthWidgetProps {
  pipelineHealth: PipelineHealth;
  loading: boolean;
}

export const PipelineHealthWidget: React.FC<PipelineHealthWidgetProps> = ({
  pipelineHealth,
  loading
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-success" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-destructive" />;
      default: return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-4 w-48" />
      </Card>
    );
  }

  const { overall_score, trend, deals_on_track, deals_need_attention, total_deals } = pipelineHealth;

  return (
    <Card className={`p-6 border shadow-sm ${getScoreBgColor(overall_score)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Pipeline Health</h3>
            <p className="text-xs text-muted-foreground">Overall deal performance</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon(trend)}
        </div>
      </div>

      <div className="flex items-center justify-center my-6">
        <div className="relative">
          {/* Circular progress indicator */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/30"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(overall_score / 100) * 352} 352`}
              strokeLinecap="round"
              className={getScoreColor(overall_score)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(overall_score)}`}>
              {overall_score}%
            </span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{deals_on_track}</p>
          <p className="text-xs text-muted-foreground">On Track</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">{deals_need_attention}</p>
          <p className="text-xs text-muted-foreground">Need Attention</p>
        </div>
      </div>

      <p className="text-sm text-center text-muted-foreground mt-4">
        {total_deals} active deal{total_deals !== 1 ? 's' : ''} in pipeline
      </p>
    </Card>
  );
};
