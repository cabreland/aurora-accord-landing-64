import React from 'react';
import { WidgetContainer } from '../shared/WidgetContainer';
import { usePipelineStats } from '@/hooks/usePipelineStats';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const PipelineWidget = () => {
  const { stages, loading, totalDeals, totalValue } = usePipelineStats();

  if (loading) {
    return (
      <WidgetContainer title="Pipeline Analytics" icon={TrendingUp}>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </WidgetContainer>
    );
  }

  const maxCount = Math.max(...stages.map(s => s.count));

  return (
    <WidgetContainer title="Pipeline Analytics" icon={TrendingUp}>
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-[#1A1F2E] rounded-lg border border-[#D4AF37]/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D4AF37]">{totalDeals}</div>
            <div className="text-xs text-[#F4E4BC]/60">Total Deals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D4AF37]">
              ${formatValue(totalValue)}
            </div>
            <div className="text-xs text-[#F4E4BC]/60">Pipeline Value</div>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-3">
          {stages.map((stage) => {
            const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            
            return (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#FAFAFA]">
                    {stage.displayName}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#F4E4BC]/60">
                    <span>{stage.count} deals</span>
                    <span>•</span>
                    <span>${formatValue(stage.totalValue)}</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full h-3 bg-[#2A2F3A] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(widthPercent, stage.count > 0 ? 8 : 0)}%`,
                        backgroundColor: stage.color
                      }}
                    />
                  </div>
                  
                  {/* Stage indicator dot */}
                  <div 
                    className="absolute top-1/2 left-1 transform -translate-y-1/2 w-2 h-2 rounded-full border-2 border-[#1A1F2E]"
                    style={{ backgroundColor: stage.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {totalDeals === 0 && (
          <div className="text-center py-6">
            <TrendingUp className="w-8 h-8 text-[#D4AF37]/50 mx-auto mb-2" />
            <p className="text-sm text-[#F4E4BC]/60">No deals in pipeline yet</p>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};

const formatValue = (value: number): string => {
  if (value === 0) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};