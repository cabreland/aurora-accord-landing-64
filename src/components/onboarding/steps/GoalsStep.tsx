import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Server, ShoppingBag, Users, MoreHorizontal, X } from 'lucide-react';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface GoalsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const businessTypes = [
  { value: 'saas', label: 'SaaS', icon: Server },
  { value: 'agency', label: 'Agency', icon: Users },
  { value: 'ecom', label: 'E-commerce', icon: ShoppingBag },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const commonIndustries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Real Estate', 'Food & Beverage', 'Marketing', 'Consulting', 'Media', 'Transportation'
];

export const GoalsStep = ({ data, updateData }: GoalsStepProps) => {
  const [newIndustry, setNewIndustry] = React.useState('');

  const handleBusinessTypeToggle = (value: string) => {
    const updated = data.idealBusinessTypes.includes(value)
      ? data.idealBusinessTypes.filter(type => type !== value)
      : [...data.idealBusinessTypes, value];
    updateData({ idealBusinessTypes: updated });
  };

  const handleIndustryToggle = (industry: string) => {
    const updated = data.industriesOfInterest.includes(industry)
      ? data.industriesOfInterest.filter(i => i !== industry)
      : [...data.industriesOfInterest, industry];
    updateData({ industriesOfInterest: updated });
  };

  const addCustomIndustry = () => {
    if (newIndustry.trim() && !data.industriesOfInterest.includes(newIndustry.trim())) {
      updateData({ industriesOfInterest: [...data.industriesOfInterest, newIndustry.trim()] });
      setNewIndustry('');
    }
  };

  const removeIndustry = (industry: string) => {
    updateData({ industriesOfInterest: data.industriesOfInterest.filter(i => i !== industry) });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          What are you looking to do?
        </h1>
      </div>
      
      <div className="space-y-12">
        <div className="flex flex-col gap-4">
          <Button
            variant={data.acquisitionGoal === 'buy_businesses' ? "default" : "outline"}
            onClick={() => updateData({ acquisitionGoal: 'buy_businesses' })}
            className="h-16 text-lg justify-start px-8"
          >
            Buy businesses
          </Button>
          <Button
            variant={data.acquisitionGoal === 'minority_partner' ? "default" : "outline"}
            onClick={() => updateData({ acquisitionGoal: 'minority_partner' })}
            className="h-16 text-lg justify-start px-8"
          >
            Invest as a minority partner
          </Button>
          <Button
            variant={data.acquisitionGoal === 'explore_options' ? "default" : "outline"}
            onClick={() => updateData({ acquisitionGoal: 'explore_options' })}
            className="h-16 text-lg justify-start px-8"
          >
            Explore options
          </Button>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Which startup types interest you?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {businessTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = data.idealBusinessTypes.includes(type.value);
              return (
                <Button
                  key={type.value}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleBusinessTypeToggle(type.value)}
                  className="h-24 flex flex-col items-center gap-2"
                >
                  <IconComponent className="w-6 h-6" />
                  <span className="text-sm">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Industries of interest
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {commonIndustries.map((industry) => (
              <Button
                key={industry}
                variant={data.industriesOfInterest.includes(industry) ? "default" : "outline"}
                onClick={() => handleIndustryToggle(industry)}
                className="h-12 text-sm"
              >
                {industry}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2 mb-4">
            <Input
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              placeholder="Add custom industry"
              onKeyDown={(e) => e.key === 'Enter' && addCustomIndustry()}
              className="h-12"
            />
            <Button type="button" onClick={addCustomIndustry} variant="outline" className="h-12">
              Add
            </Button>
          </div>
          
          {data.industriesOfInterest.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.industriesOfInterest.map((industry) => (
                <Badge key={industry} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                  {industry}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5 hover:bg-transparent"
                    onClick={() => removeIndustry(industry)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};