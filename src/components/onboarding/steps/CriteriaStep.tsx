import React from 'react';
import { Label } from '@/components/ui/label';
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

export const CriteriaStep = ({ data, updateData }: CriteriaStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Deal Criteria</h2>
        <p className="text-muted-foreground">
          Define your investment criteria to help us find the right opportunities.
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <Label>TTM Revenue Range</Label>
          <div className="px-4">
            <Slider
              value={[data.ttmRevenueMin, data.ttmRevenueMax]}
              onValueChange={([min, max]) => updateData({ ttmRevenueMin: min, ttmRevenueMax: max })}
              max={50000000}
              min={0}
              step={50000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatCurrency(data.ttmRevenueMin)}</span>
              <span>{formatCurrency(data.ttmRevenueMax)}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>TTM Profit Range</Label>
          <div className="px-4">
            <Slider
              value={[data.ttmProfitMin, data.ttmProfitMax]}
              onValueChange={([min, max]) => updateData({ ttmProfitMin: min, ttmProfitMax: max })}
              max={25000000}
              min={0}
              step={25000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatCurrency(data.ttmProfitMin)}</span>
              <span>{formatCurrency(data.ttmProfitMax)}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>Ideal Asking Price Range</Label>
          <div className="px-4">
            <Slider
              value={[data.askingPriceMin, data.askingPriceMax]}
              onValueChange={([min, max]) => updateData({ askingPriceMin: min, askingPriceMax: max })}
              max={100000000}
              min={0}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatCurrency(data.askingPriceMin)}</span>
              <span>{formatCurrency(data.askingPriceMax)}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>Profit Multiple Range</Label>
          <div className="px-4">
            <Slider
              value={[data.profitMultipleMin, data.profitMultipleMax]}
              onValueChange={([min, max]) => updateData({ profitMultipleMin: min, profitMultipleMax: max })}
              max={20}
              min={0.5}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{data.profitMultipleMin}x</span>
              <span>{data.profitMultipleMax}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};