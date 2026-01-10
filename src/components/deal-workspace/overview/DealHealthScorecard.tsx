import React from 'react';
import { TrendingUp, TrendingDown, Minus, FileText, MessageSquare, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DealHealthScorecardProps {
  overallScore: number;
  documentCompletion: number;
  requestResponseRate: number;
  teamEngagement: number;
  timelineStatus: 'on_track' | 'at_risk' | 'critical';
  trend?: number; // percentage change from last week
  documentsTotal: number;
  documentsCompleted: number;
  requestsTotal: number;
  requestsAnswered: number;
  teamSize: number;
}

const getHealthStatus = (score: number): { label: string; color: string; bgColor: string } => {
  if (score >= 70) return { label: 'On Track', color: 'text-green-600', bgColor: 'bg-green-500' };
  if (score >= 40) return { label: 'At Risk', color: 'text-amber-600', bgColor: 'bg-amber-500' };
  return { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-500' };
};

const getTimelineLabel = (status: 'on_track' | 'at_risk' | 'critical'): { label: string; color: string } => {
  switch (status) {
    case 'on_track': return { label: 'On Track', color: 'text-green-600' };
    case 'at_risk': return { label: 'At Risk', color: 'text-amber-600' };
    case 'critical': return { label: 'Critical', color: 'text-red-600' };
  }
};

export const DealHealthScorecard: React.FC<DealHealthScorecardProps> = ({
  overallScore,
  documentCompletion,
  requestResponseRate,
  teamEngagement,
  timelineStatus,
  trend = 0,
  documentsTotal,
  documentsCompleted,
  requestsTotal,
  requestsAnswered,
  teamSize,
}) => {
  const health = getHealthStatus(overallScore);
  const timeline = getTimelineLabel(timelineStatus);

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Main Score Circle */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 relative">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${overallScore * 3.52} 352`}
                  className={cn(
                    'transition-all duration-1000 ease-out',
                    overallScore >= 70 && 'text-green-500',
                    overallScore >= 40 && overallScore < 70 && 'text-amber-500',
                    overallScore < 40 && 'text-red-500'
                  )}
                />
              </svg>
              {/* Score number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">{overallScore}%</span>
                <span className="text-xs text-muted-foreground">Health</span>
              </div>
            </div>
            
            {/* Status badge below circle */}
            <div className="text-center mt-2">
              <Badge className={cn(
                'text-xs font-medium',
                overallScore >= 70 && 'bg-green-100 text-green-800 hover:bg-green-100',
                overallScore >= 40 && overallScore < 70 && 'bg-amber-100 text-amber-800 hover:bg-amber-100',
                overallScore < 40 && 'bg-red-100 text-red-800 hover:bg-red-100'
              )}>
                {health.label}
              </Badge>
              {trend !== 0 && (
                <div className={cn(
                  'flex items-center justify-center gap-1 mt-1 text-xs',
                  trend > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{trend > 0 ? '+' : ''}{trend}% vs last week</span>
                </div>
              )}
            </div>
          </div>

          {/* Sub-scores Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* Document Completion */}
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Documents</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{documentCompletion}%</span>
              </div>
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-500 rounded-full',
                    documentCompletion >= 70 && 'bg-green-500',
                    documentCompletion >= 40 && documentCompletion < 70 && 'bg-amber-500',
                    documentCompletion < 40 && 'bg-red-500'
                  )}
                  style={{ width: `${documentCompletion}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {documentsCompleted}/{documentsTotal} folders
              </p>
            </div>

            {/* Request Response Rate */}
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-medium">Responses</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{requestResponseRate}%</span>
              </div>
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-500 rounded-full',
                    requestResponseRate >= 70 && 'bg-green-500',
                    requestResponseRate >= 40 && requestResponseRate < 70 && 'bg-amber-500',
                    requestResponseRate < 40 && 'bg-red-500'
                  )}
                  style={{ width: `${requestResponseRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {requestsAnswered}/{requestsTotal} answered
              </p>
            </div>

            {/* Team Engagement */}
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Team</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{teamEngagement}%</span>
              </div>
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-500 rounded-full',
                    teamEngagement >= 70 && 'bg-green-500',
                    teamEngagement >= 40 && teamEngagement < 70 && 'bg-amber-500',
                    teamEngagement < 40 && 'bg-red-500'
                  )}
                  style={{ width: `${teamEngagement}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {teamSize} member{teamSize !== 1 ? 's' : ''} active
              </p>
            </div>

            {/* Timeline Adherence */}
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Timeline</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  'text-xs',
                  timelineStatus === 'on_track' && 'bg-green-100 text-green-800 hover:bg-green-100',
                  timelineStatus === 'at_risk' && 'bg-amber-100 text-amber-800 hover:bg-amber-100',
                  timelineStatus === 'critical' && 'bg-red-100 text-red-800 hover:bg-red-100'
                )}>
                  {timeline.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {timelineStatus === 'on_track' ? 'No delays' : 
                 timelineStatus === 'at_risk' ? 'Minor delays' : 'Major delays'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
