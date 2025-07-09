import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface GoalsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const businessTypes = [
  { value: 'saas', label: 'SaaS' },
  { value: 'agency', label: 'Agency' },
  { value: 'ecom', label: 'E-commerce' },
  { value: 'other', label: 'Other' },
];

const commonIndustries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Real Estate', 'Food & Beverage', 'Marketing', 'Consulting', 'Media', 'Transportation'
];

export const GoalsStep = ({ data, updateData }: GoalsStepProps) => {
  const [newIndustry, setNewIndustry] = React.useState('');

  const handleBusinessTypeToggle = (value: string, checked: boolean) => {
    const updated = checked
      ? [...data.idealBusinessTypes, value]
      : data.idealBusinessTypes.filter(type => type !== value);
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Acquisition Goals</h2>
        <p className="text-muted-foreground">
          Help us understand what you're looking to achieve.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>What are you looking to do?</Label>
          <RadioGroup
            value={data.acquisitionGoal}
            onValueChange={(value) => updateData({ acquisitionGoal: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="buy_businesses" id="buy-businesses" />
              <Label htmlFor="buy-businesses">Buy businesses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minority_partner" id="minority-partner" />
              <Label htmlFor="minority-partner">Invest as a minority partner</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="explore_options" id="explore-options" />
              <Label htmlFor="explore-options">Explore options</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-3">
          <Label>What is your ideal business type? (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-3">
            {businessTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={data.idealBusinessTypes.includes(type.value)}
                  onCheckedChange={(checked) => handleBusinessTypeToggle(type.value, checked as boolean)}
                />
                <Label htmlFor={`type-${type.value}`}>{type.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Industries of Interest</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {commonIndustries.map((industry) => (
              <div
                key={industry}
                className={`p-2 rounded-md border cursor-pointer transition-colors ${
                  data.industriesOfInterest.includes(industry)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent'
                }`}
                onClick={() => handleIndustryToggle(industry)}
              >
                <span className="text-sm">{industry}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              placeholder="Add custom industry"
              onKeyDown={(e) => e.key === 'Enter' && addCustomIndustry()}
            />
            <Button type="button" onClick={addCustomIndustry} variant="outline">
              Add
            </Button>
          </div>
          
          {data.industriesOfInterest.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.industriesOfInterest.map((industry) => (
                <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                  {industry}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5"
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