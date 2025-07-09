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

// Simple histogram component
const Histogram = ({ height = 80, className = "" }: { height?: number; className?: string }) => {
  const bars = [
    8, 12, 18, 25, 35, 45, 55, 48, 42, 38, 32, 28, 24, 20, 16, 12, 8, 6, 4, 3, 2, 1, 1, 0, 0, 0, 1, 2, 3, 5
  ];
  
  return (
    <div className={`flex items-end justify-center gap-1 ${className}`} style={{ height }}>
      {bars.map((bar, index) => (
        <div
          key={index}
          className="bg-blue-500 min-w-[2px]"
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
  <div className="space-y-6">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {title}
      </h1>
    </div>
    
    <div className="max-w-2xl mx-auto">
      <Histogram className="mb-8" />
      
      <div className="px-8">
        <Slider
          value={value}
          onValueChange={onChange}
          max={max}
          min={min}
          step={step}
          className="w-full mb-4"
        />
        
        <div className="flex justify-between items-center">
          <div className="text-center">
            <span className="text-sm text-gray-500">Min</span>
            <div className="text-lg font-semibold">{format(value[0])}</div>
          </div>
          <span className="text-gray-300">—</span>
          <div className="text-center">
            <span className="text-sm text-gray-500">Max</span>
            <div className="text-lg font-semibold">{format(value[1])}</div>
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