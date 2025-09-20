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
              <div 
                key={stage.stage} 
                className="group space-y-2 p-2 rounded-lg transition-all duration-200 hover:bg-[#1A1F2E]/50"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-semibold text-[#F4E4BC] truncate flex-1 min-w-0 group-hover:text-[#FAFAFA] transition-colors">
                    {stage.displayName}
                  </span>
                  <div className="flex flex-col items-end gap-1 text-xs text-[#F4E4BC]/80 flex-shrink-0">
                    <span className="whitespace-nowrap font-medium">{stage.count} deals</span>
                    <span className="whitespace-nowrap font-medium">${formatValue(stage.totalValue)}</span>
                  </div>
                </div>
                
                <div className="relative group-hover:scale-[1.01] transition-transform duration-200">
                  <div className="w-full h-4 bg-[#2A2F3A] rounded-full overflow-hidden border border-[#D4AF37]/10">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ 
                        width: `${Math.max(widthPercent, stage.count > 0 ? 12 : 0)}%`,
                        backgroundColor: stage.color
                      }}
                    >
                      {/* Subtle gradient overlay for better visual appeal */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-full"
                      />
                    </div>
                  </div>
                  
                  {/* Stage indicator dot with improved visibility */}
                  <div 
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#1A1F2E] group-hover:scale-110 transition-all duration-200"
                    style={{ backgroundColor: stage.color }}
                  />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#0A0F0F] text-[#F4E4BC] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                    {stage.count} deals • ${formatValue(stage.totalValue)} value
                  </div>
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