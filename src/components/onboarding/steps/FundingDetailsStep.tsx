import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { OnboardingFormData } from '@/pages/InvestorOnboardingNew';

interface FundingDetailsStepProps {
  data: OnboardingFormData;
  updateData: (data: Partial<OnboardingFormData>) => void;
  setIsValid: (valid: boolean) => void;
}

const fundingTypes = [
  { value: 'self-funded', label: 'Self-Funded / Cash' },
  { value: 'sba', label: 'SBA Loan' },
  { value: 'bank', label: 'Traditional Bank Financing' },
  { value: 'seller', label: 'Seller Financing' },
  { value: 'pe', label: 'Private Equity Backed' },
  { value: 'search-fund', label: 'Search Fund' },
  { value: 'combination', label: 'Combination of Sources' },
];

const timelineOptions = [
  { value: 'immediately', label: 'Immediately (0-3 months)' },
  { value: 'near-term', label: 'Near-term (3-6 months)' },
  { value: 'mid-term', label: 'Mid-term (6-12 months)' },
  { value: 'long-term', label: 'Long-term (12+ months)' },
  { value: 'exploring', label: 'Just exploring' },
];

const proofOfFundsOptions = [
  { value: 'ready', label: 'Yes - Ready to provide documentation' },
  { value: 'two-weeks', label: 'Yes - Can obtain within 2 weeks' },
  { value: 'arrange', label: 'No - Will need to arrange financing' },
  { value: 'evaluating', label: 'Not Yet - Still evaluating options' },
];

const referralOptions = [
  { value: 'referral', label: 'Referral from...' },
  { value: 'google', label: 'Google Search' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'publication', label: 'Industry Publication' },
  { value: 'conference', label: 'Conference/Event' },
  { value: 'other', label: 'Other' },
];

export const FundingDetailsStep = ({ data, updateData, setIsValid }: FundingDetailsStepProps) => {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const isCombinationSelected = data.fundingType === 'combination';
  const fundingSourcesError = touched.fundingSources && isCombinationSelected && data.fundingSources.length < 10
    ? 'Please describe your funding sources (min 10 characters)'
    : '';

  useEffect(() => {
    const isValid = 
      data.fundingType !== '' && 
      data.proofOfFunds !== '' &&
      data.timelineToClose !== '' &&
      (!isCombinationSelected || data.fundingSources.length >= 10);
    setIsValid(isValid);
  }, [data, setIsValid, isCombinationSelected]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Funding Approach</h2>
      <p className="text-gray-600 mb-8">How will you structure this acquisition?</p>

      <div className="space-y-8">
        {/* Funding Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Funding Type <span className="text-red-500">*</span>
          </Label>
          <Select value={data.fundingType} onValueChange={(v) => updateData({ fundingType: v })}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]">
              <SelectValue placeholder="Select funding type" />
            </SelectTrigger>
            <SelectContent>
              {fundingTypes.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Funding Sources Textarea */}
        {isCombinationSelected && (
          <div>
            <Label htmlFor="fundingSources" className="text-sm font-medium text-gray-700 mb-3 block">
              Please list your funding sources <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="fundingSources"
              value={data.fundingSources}
              onChange={(e) => {
                const value = e.target.value.slice(0, 300);
                updateData({ fundingSources: value });
              }}
              onBlur={() => handleBlur('fundingSources')}
              placeholder="Example: 50% cash, 30% SBA loan, 20% seller note"
              className={`min-h-[80px] resize-none border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37] ${
                fundingSourcesError ? 'border-red-500' : ''
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {fundingSourcesError ? (
                <p className="text-red-500 text-sm">{fundingSourcesError}</p>
              ) : (
                <span />
              )}
              <span className={`text-sm ${data.fundingSources.length >= 300 ? 'text-red-500' : 'text-gray-400'}`}>
                {data.fundingSources.length} / 300
              </span>
            </div>
          </div>
        )}

        {/* Proof of Funds */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Do you have proof of funds available? <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-3">
            {proofOfFundsOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateData({ proofOfFunds: opt.value })}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                  data.proofOfFunds === opt.value
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline to Close */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Timeline to Close <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-3">
            {timelineOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateData({ timelineToClose: opt.value })}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                  data.timelineToClose === opt.value
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Referral Source */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            How did you hear about us? <span className="text-gray-400">(optional)</span>
          </Label>
          <Select value={data.referralSource} onValueChange={(v) => updateData({ referralSource: v })}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {referralOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {data.referralSource === 'referral' && (
            <div className="mt-3">
              <Input
                placeholder="Who referred you?"
                value={data.referralDetails}
                onChange={(e) => updateData({ referralDetails: e.target.value })}
                className="h-12 border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};