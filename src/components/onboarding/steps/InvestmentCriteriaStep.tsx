import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, MapPin, Flag, Earth } from 'lucide-react';
import type { OnboardingFormData } from '@/pages/InvestorOnboardingNew';

interface InvestmentCriteriaStepProps {
  data: OnboardingFormData;
  updateData: (data: Partial<OnboardingFormData>) => void;
  setIsValid: (valid: boolean) => void;
}

const industries = [
  'SaaS / Software',
  'E-commerce / DTC',
  'Digital Agency',
  'Marketing Agency',
  'Professional Services',
  'Healthcare Services',
  'Manufacturing',
  'Real Estate',
  'Financial Services',
];

const minInvestmentOptions = [
  { value: '<500K', label: '<$500K' },
  { value: '500K', label: '$500K' },
  { value: '1M', label: '$1M' },
  { value: '2M', label: '$2M' },
  { value: '3M', label: '$3M' },
  { value: '5M', label: '$5M' },
  { value: '10M+', label: '$10M+' },
];

const maxInvestmentOptions = [
  { value: '500K', label: '$500K' },
  { value: '1M', label: '$1M' },
  { value: '2M', label: '$2M' },
  { value: '3M', label: '$3M' },
  { value: '5M', label: '$5M' },
  { value: '10M', label: '$10M' },
  { value: '25M+', label: '$25M+' },
];

const revenueOptions = [
  { value: '<500K', label: '<$500K' },
  { value: '500K-1M', label: '$500K-$1M' },
  { value: '1M-3M', label: '$1M-$3M' },
  { value: '3M-5M', label: '$3M-$5M' },
  { value: '5M-10M', label: '$5M-$10M' },
  { value: '10M+', label: '$10M+' },
];

const ebitdaOptions = [
  { value: '<100K', label: '<$100K' },
  { value: '100K-500K', label: '$100K-$500K' },
  { value: '500K-1M', label: '$500K-$1M' },
  { value: '1M-3M', label: '$1M-$3M' },
  { value: '3M+', label: '$3M+' },
  { value: 'not-important', label: 'Not important' },
];

const geographicOptions = [
  { value: 'us-only', label: 'US Only', icon: Flag },
  { value: 'north-america', label: 'North America', icon: MapPin },
  { value: 'international', label: 'International OK', icon: Globe },
  { value: 'no-preference', label: 'No Preference', icon: Earth },
];

export const InvestmentCriteriaStep = ({ data, updateData, setIsValid }: InvestmentCriteriaStepProps) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleIndustryToggle = (industry: string) => {
    const updated = data.targetIndustries.includes(industry)
      ? data.targetIndustries.filter(i => i !== industry)
      : [...data.targetIndustries, industry];
    updateData({ targetIndustries: updated });
  };

  const validateInvestmentRange = () => {
    const minIndex = minInvestmentOptions.findIndex(o => o.value === data.minInvestment);
    const maxIndex = maxInvestmentOptions.findIndex(o => o.value === data.maxInvestment);
    
    if (minIndex === -1 || maxIndex === -1) return true;
    
    // Simple comparison based on order (this is a simplification)
    const minValues: Record<string, number> = { '<500K': 0, '500K': 500, '1M': 1000, '2M': 2000, '3M': 3000, '5M': 5000, '10M+': 10000 };
    const maxValues: Record<string, number> = { '500K': 500, '1M': 1000, '2M': 2000, '3M': 3000, '5M': 5000, '10M': 10000, '25M+': 25000 };
    
    return maxValues[data.maxInvestment] >= minValues[data.minInvestment];
  };

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (data.targetIndustries.length === 0) {
      newErrors.industries = 'Select at least one industry';
    }

    if (!data.minInvestment) {
      newErrors.minInvestment = 'Required';
    }

    if (!data.maxInvestment) {
      newErrors.maxInvestment = 'Required';
    }

    if (data.minInvestment && data.maxInvestment && !validateInvestmentRange()) {
      newErrors.investmentRange = 'Maximum must be greater than minimum';
    }

    if (!data.revenueRange) {
      newErrors.revenueRange = 'Required';
    }

    if (!data.ebitdaRange) {
      newErrors.ebitdaRange = 'Required';
    }

    if (!data.geographicPreference) {
      newErrors.geographicPreference = 'Required';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [data, setIsValid]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Criteria</h2>
      <p className="text-gray-600 mb-8">Tell us what you're looking for</p>

      <div className="space-y-8">
        {/* Target Industries */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Target Industries <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {industries.map((industry) => (
              <label
                key={industry}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  data.targetIndustries.includes(industry)
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox
                  checked={data.targetIndustries.includes(industry)}
                  onCheckedChange={() => handleIndustryToggle(industry)}
                  className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <span className="text-sm text-gray-700">{industry}</span>
              </label>
            ))}
          </div>
          {errors.industries && (
            <p className="text-red-500 text-sm mt-2">{errors.industries}</p>
          )}
        </div>

        {/* Investment Size Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            What's your budget range? <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Minimum</Label>
              <Select value={data.minInvestment} onValueChange={(v) => updateData({ minInvestment: v })}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]">
                  <SelectValue placeholder="Select minimum" />
                </SelectTrigger>
                <SelectContent>
                  {minInvestmentOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Maximum</Label>
              <Select value={data.maxInvestment} onValueChange={(v) => updateData({ maxInvestment: v })}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]">
                  <SelectValue placeholder="Select maximum" />
                </SelectTrigger>
                <SelectContent>
                  {maxInvestmentOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {errors.investmentRange && (
            <p className="text-red-500 text-sm mt-2">{errors.investmentRange}</p>
          )}
        </div>

        {/* Revenue Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Revenue Range Preference <span className="text-red-500">*</span>
          </Label>
          <Select value={data.revenueRange} onValueChange={(v) => updateData({ revenueRange: v })}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]">
              <SelectValue placeholder="Select revenue range" />
            </SelectTrigger>
            <SelectContent>
              {revenueOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* EBITDA Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            EBITDA Range Preference <span className="text-red-500">*</span>
          </Label>
          <Select value={data.ebitdaRange} onValueChange={(v) => updateData({ ebitdaRange: v })}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]">
              <SelectValue placeholder="Select EBITDA range" />
            </SelectTrigger>
            <SelectContent>
              {ebitdaOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Geographic Preference */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Geographic Preference <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {geographicOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateData({ geographicPreference: opt.value })}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    data.geographicPreference === opt.value
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${data.geographicPreference === opt.value ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
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
