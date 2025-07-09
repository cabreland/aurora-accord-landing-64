import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Share2, MessageCircle } from 'lucide-react';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface MarketingStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const referralOptions = [
  { value: 'referral', label: 'Personal referral', icon: Users },
  { value: 'social_media', label: 'Social media', icon: Share2 },
  { value: 'search', label: 'Google search', icon: Search },
  { value: 'other', label: 'Other', icon: MessageCircle },
];

export const MarketingStep = ({ data, updateData }: MarketingStepProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How did you hear about us?
        </h1>
      </div>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4">
          {referralOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.value}
                variant={data.referralSource === option.value ? "default" : "outline"}
                onClick={() => updateData({ referralSource: option.value })}
                className="h-16 justify-start gap-4 px-6 text-lg"
              >
                <IconComponent className="w-6 h-6" />
                {option.label}
              </Button>
            );
          })}
        </div>
        
        {(data.referralSource === 'referral' || data.referralSource === 'other') && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-semibold text-gray-900">
              {data.referralSource === 'referral' 
                ? 'Who referred you to us?' 
                : 'Please tell us more'
              }
            </h2>
            <Textarea
              value={data.referralOtherDetails}
              onChange={(e) => updateData({ referralOtherDetails: e.target.value })}
              placeholder={
                data.referralSource === 'referral' 
                  ? 'Please tell us who referred you'
                  : 'Please provide more details'
              }
              rows={4}
              className="text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Illustration placeholder */}
      <div className="mt-16 flex justify-center">
        <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <div className="text-6xl">🚀</div>
        </div>
      </div>
    </div>
  );
};