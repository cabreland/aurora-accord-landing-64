import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MessageSquare, Video } from 'lucide-react';
import type { OnboardingFormData } from '@/pages/InvestorOnboardingNew';

interface DealPreferencesStepProps {
  data: OnboardingFormData;
  updateData: (data: Partial<OnboardingFormData>) => void;
  setIsValid: (valid: boolean) => void;
}

const primaryGoals = [
  { value: 'operate', label: 'Acquire and actively operate' },
  { value: 'hire-operator', label: 'Acquire and hire operator' },
  { value: 'passive-income', label: 'Generate passive income' },
  { value: 'add-on', label: 'Strategic add-on to existing business' },
  { value: 'diversification', label: 'Portfolio diversification' },
];

const mustHaveOptions = [
  'Remote-capable business',
  'Recurring revenue model',
  'Low customer concentration',
  'Seller willing to train/transition',
  'Small team (under 25 employees)',
  'Established brand',
  'Strong cash flow',
  'Asset-light',
];

const communicationOptions = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'text', label: 'Text/SMS', icon: MessageSquare },
  { value: 'video', label: 'Video Call', icon: Video },
];

export const DealPreferencesStep = ({ data, updateData, setIsValid }: DealPreferencesStepProps) => {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const handleMustHaveToggle = (item: string) => {
    const updated = data.mustHaves.includes(item)
      ? data.mustHaves.filter(i => i !== item)
      : [...data.mustHaves, item];
    updateData({ mustHaves: updated });
  };

  useEffect(() => {
    const isValid = 
      data.primaryGoal !== '' && 
      data.communicationPreference !== '' &&
      data.dealBreakersText.length >= 20;
    setIsValid(isValid);
  }, [data, setIsValid]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const dealBreakersError = touched.dealBreakersText && data.dealBreakersText.length < 20
    ? 'Please provide at least 20 characters describing your deal breakers'
    : '';

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Deal Preferences</h2>
      <p className="text-gray-600 mb-8">What matters most to you?</p>

      <div className="space-y-8">
        {/* Primary Goal */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Primary Goal <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-3">
            {primaryGoals.map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => updateData({ primaryGoal: goal.value })}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                  data.primaryGoal === goal.value
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium text-gray-700">{goal.label}</span>
              </button>
            ))}
          </div>
          {!data.primaryGoal && (
            <p className="text-gray-500 text-sm mt-2">Please select your primary goal</p>
          )}
        </div>

        {/* Must-Haves */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            What features are essential? <span className="text-gray-400">(optional)</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {mustHaveOptions.map((item) => (
              <label
                key={item}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  data.mustHaves.includes(item)
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox
                  checked={data.mustHaves.includes(item)}
                  onCheckedChange={() => handleMustHaveToggle(item)}
                  className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Deal Breakers - Textarea */}
        <div>
          <Label htmlFor="dealBreakersText" className="text-sm font-medium text-gray-700 mb-3 block">
            What would make you walk away from a deal? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="dealBreakersText"
            value={data.dealBreakersText}
            onChange={(e) => {
              const value = e.target.value.slice(0, 500);
              updateData({ dealBreakersText: value });
            }}
            onBlur={() => handleBlur('dealBreakersText')}
            placeholder="Describe specific red flags or concerns that would cause you to reject a deal. Example: Customer concentration over 30%, declining revenue, heavy regulatory requirements, etc."
            className={`min-h-[120px] resize-none border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37] ${
              dealBreakersError ? 'border-red-500' : ''
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {dealBreakersError ? (
              <p className="text-red-500 text-sm">{dealBreakersError}</p>
            ) : (
              <p className="text-gray-500 text-xs">Minimum 20 characters required</p>
            )}
            <span className={`text-sm ${data.dealBreakersText.length >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
              {data.dealBreakersText.length} / 500
            </span>
          </div>
        </div>

        {/* Communication Preference */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Preferred Communication <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {communicationOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateData({ communicationPreference: opt.value })}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    data.communicationPreference === opt.value
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${data.communicationPreference === opt.value ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};