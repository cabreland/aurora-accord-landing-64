import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface BusinessStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export const BusinessStep = ({ data, updateData }: BusinessStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">About Your Business</h2>
        <p className="text-muted-foreground">
          Tell us about your current business experience and operations.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Do you currently own or operate a business?</Label>
          <RadioGroup
            value={data.ownsBusiness?.toString() || ''}
            onValueChange={(value) => updateData({ ownsBusiness: value === 'true' })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="owns-yes" />
              <Label htmlFor="owns-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="owns-no" />
              <Label htmlFor="owns-no">No</Label>
            </div>
          </RadioGroup>
        </div>
        
        {data.ownsBusiness && (
          <>
            <div className="space-y-2">
              <Label>What type of business is it?</Label>
              <Select
                value={data.businessType}
                onValueChange={(value) => updateData({ businessType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecom">E-commerce</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Approximate Annual Revenue</Label>
                <Input
                  id="annualRevenue"
                  value={data.annualRevenue}
                  onChange={(e) => updateData({ annualRevenue: e.target.value })}
                  placeholder="$500,000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="annualProfit">Approximate Annual Profit</Label>
                <Input
                  id="annualProfit"
                  value={data.annualProfit}
                  onChange={(e) => updateData({ annualProfit: e.target.value })}
                  placeholder="$100,000"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};