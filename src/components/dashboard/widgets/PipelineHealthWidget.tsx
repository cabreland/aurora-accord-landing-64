import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getProgressBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': 
        return (
          <div className="flex items-center gap-1 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Improving</span>
          </div>
        );
      case 'down': 
        return (
          <div className="flex items-center gap-1 text-red-500">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">Declining</span>
          </div>
        );
      default: 
        return (
          <div className="flex items-center gap-1 text-gray-500">
            <Minus className="w-4 h-4" />
            <span className="text-xs font-medium">Stable</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl h-full">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-12 w-24 mb-4" />
        <Skeleton className="h-2 w-full mb-6" />
        <div className="flex gap-8">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </Card>
    );
  }

  const { overall_score, trend, deals_on_track, deals_need_attention, total_deals } = pipelineHealth;

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Pipeline Health
        </span>
        {getTrendIcon(trend)}
      </div>

      {/* Large Score Display */}
      <div className="mb-4">
        <span className={`text-5xl font-bold tracking-tight ${getScoreColor(overall_score)}`}>
          {overall_score}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className={`h-2 rounded-full ${getProgressBgColor(overall_score)} mb-6`}>
        <div 
          className={`h-full rounded-full ${getProgressColor(overall_score)} transition-all duration-500`}
          style={{ width: `${overall_score}%` }}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-8 mt-auto">
        <div>
          <p className="text-2xl font-bold text-gray-900">{deals_on_track}</p>
          <p className="text-sm text-gray-500">On track</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-gray-900">{deals_need_attention}</p>
          <p className="text-sm text-gray-500">Need attention</p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
        {total_deals} active deal{total_deals !== 1 ? 's' : ''} in pipeline
      </p>
    </Card>
  );
};
