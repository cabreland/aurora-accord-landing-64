import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface MarketingStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export const MarketingStep = ({ data, updateData }: MarketingStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">How Did You Hear About Us?</h2>
        <p className="text-muted-foreground">
          Help us understand how you discovered EBB Data Room.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>How did you hear about us?</Label>
          <RadioGroup
            value={data.referralSource}
            onValueChange={(value) => updateData({ referralSource: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="referral" id="referral" />
              <Label htmlFor="referral">Referral from someone I know</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="social_media" id="social-media" />
              <Label htmlFor="social-media">Social Media (LinkedIn, Twitter, etc.)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="search" id="search" />
              <Label htmlFor="search">Search Engine (Google, Bing, etc.)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>
        
        {(data.referralSource === 'referral' || data.referralSource === 'other') && (
          <div className="space-y-2">
            <Label htmlFor="referralDetails">
              {data.referralSource === 'referral' 
                ? 'Who referred you to us?' 
                : 'Please specify how you heard about us'
              }
            </Label>
            <Textarea
              id="referralDetails"
              value={data.referralOtherDetails}
              onChange={(e) => updateData({ referralOtherDetails: e.target.value })}
              placeholder={
                data.referralSource === 'referral' 
                  ? 'Please tell us who referred you'
                  : 'Please provide more details'
              }
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
};