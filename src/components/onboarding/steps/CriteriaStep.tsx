import React from 'react';
import { Slider } from '@/components/ui/slider';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface CriteriaStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
};

// Enhanced histogram component with gradient
const Histogram = ({ height = 120, className = "" }: { height?: number; className?: string }) => {
  const bars = [
    8, 12, 18, 25, 35, 45, 55, 48, 42, 38, 32, 28, 24, 20, 16, 12, 8, 6, 4, 3, 2, 1, 1, 0, 0, 0, 1, 2, 3, 5
  ];
  
  return (
    <div className={`flex items-end justify-center gap-1 ${className}`} style={{ height }}>
      {bars.map((bar, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-purple-500 via-blue-500 to-emerald-400 min-w-[3px] rounded-t-sm shadow-sm"
          style={{ height: `${(bar / Math.max(...bars)) * 100}%` }}
        />
      ))}
    </div>
  );
};

const SliderSection = ({ 
  title, 
  min, 
  max, 
  step, 
  value, 
  onChange, 
  format = formatCurrency 
}: {
  title: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  format?: (value: number) => string;
}) => (
  <div className="space-y-8">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 gradient-warm rounded-full mb-6 animate-bounce-slow">
        <span className="text-3xl">📊</span>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
        {title}
      </h1>
    </div>
    
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
        <Histogram className="mb-8" height={120} />
        
        <div className="px-8">
          <Slider
            value={value}
            onValueChange={onChange}
            max={max}
            min={min}
            step={step}
            className="w-full mb-6"
          />
          
          <div className="flex justify-between items-center">
            <div className="text-center bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-4 min-w-[120px]">
              <span className="text-sm text-purple-600 font-medium">Min</span>
              <div className="text-xl font-bold text-purple-700">{format(value[0])}</div>
            </div>
            <div className="flex items-center mx-4">
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400"></div>
            </div>
            <div className="text-center bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl p-4 min-w-[120px]">
              <span className="text-sm text-blue-600 font-medium">Max</span>
              <div className="text-xl font-bold text-blue-700">{format(value[1])}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const CriteriaStep = ({ data, updateData }: CriteriaStepProps) => {
  const criteriaSteps = [
    {
      title: "What is your ideal trailing twelve-month (TTM) revenue range?",
      value: [data.ttmRevenueMin, data.ttmRevenueMax] as [number, number],
      onChange: ([min, max]: [number, number]) => updateData({ ttmRevenueMin: min, ttmRevenueMax: max }),
      min: 0,
      max: 50000000,
      step: 50000,
    },
    {
      title: "What is your ideal trailing twelve-month (TTM) profit range?",
      value: [data.ttmProfitMin, data.ttmProfitMax] as [number, number],
      onChange: ([min, max]: [number, number]) => updateData({ ttmProfitMin: min, ttmProfitMax: max }),
      min: 0,
      max: 25000000,
      step: 25000,
    },
    {
      title: "What is your ideal asking price range?",
      value: [data.askingPriceMin, data.askingPriceMax] as [number, number],
      onChange: ([min, max]: [number, number]) => updateData({ askingPriceMin: min, askingPriceMax: max }),
      min: 0,
      max: 100000000,
      step: 100000,
    },
    {
      title: "What is your ideal profit multiple range?",
      value: [data.profitMultipleMin, data.profitMultipleMax] as [number, number],
      onChange: ([min, max]: [number, number]) => updateData({ profitMultipleMin: min, profitMultipleMax: max }),
      min: 0.5,
      max: 20,
      step: 0.5,
      format: (value: number) => `${value}x`,
    },
  ];

  // For now, show the first criteria step. In a real implementation, you might cycle through them
  const currentCriteria = criteriaSteps[0];

  return (
    <div className="max-w-4xl mx-auto">
      <SliderSection {...currentCriteria} />
    </div>
  );
};