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
        <div className="inline-flex items-center justify-center w-20 h-20 gradient-cool rounded-full mb-6 animate-float">
          <span className="text-3xl">🤔</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          How did you hear about us?
        </h1>
        <p className="text-lg text-gray-600">We'd love to know how you discovered our platform!</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {referralOptions.map((option, index) => {
            const IconComponent = option.icon;
            const colors = ['purple', 'blue', 'emerald', 'yellow'];
            const color = colors[index % colors.length];
            const emojis = ['👥', '📱', '🔍', '💬'];
            return (
              <Button
                key={option.value}
                variant={data.referralSource === option.value ? "default" : "outline"}
                onClick={() => updateData({ referralSource: option.value })}
                className={`h-18 justify-start gap-4 px-8 text-lg rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  data.referralSource === option.value 
                    ? `gradient-${color === 'yellow' ? 'warm' : 'primary'} text-white shadow-lg` 
                    : `border-2 border-${color}-200 hover:border-${color}-400 bg-white/80 backdrop-blur-sm`
                }`}
              >
                <span className="text-2xl">{emojis[index]}</span>
                <div className="flex items-center gap-3">
                  <IconComponent className="w-6 h-6" />
                  {option.label}
                </div>
              </Button>
            );
          })}
        </div>
        
        {(data.referralSource === 'referral' || data.referralSource === 'other') && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                {data.referralSource === 'referral' 
                  ? '👋 Who referred you to us?' 
                  : '💭 Please tell us more'
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
                className="text-lg border-2 border-purple-100 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced illustration */}
      <div className="mt-16 flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 gradient-rainbow rounded-full flex items-center justify-center animate-bounce-slow shadow-lg">
            <span className="text-4xl animate-float">🚀</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
            <span className="text-lg">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
};