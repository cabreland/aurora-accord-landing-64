import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Calendar, CalendarClock, Clock, Search } from 'lucide-react';
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
  { value: 'immediately', label: 'Immediately (0-3 months)', emoji: '⚡' },
  { value: 'near-term', label: 'Near-term (3-6 months)', emoji: '📅' },
  { value: 'mid-term', label: 'Mid-term (6-12 months)', emoji: '🗓️' },
  { value: 'long-term', label: 'Long-term (12+ months)', emoji: '🔮' },
  { value: 'exploring', label: 'Just exploring', emoji: '🔍' },
];

const preQualifiedOptions = [
  { value: 'yes', label: 'Yes - Pre-approved' },
  { value: 'in-process', label: 'In Process' },
  { value: 'not-yet', label: 'Not Yet' },
  { value: 'na', label: 'N/A (Self-funded)' },
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
  useEffect(() => {
    const isValid = 
      data.fundingType !== '' && 
      data.timelineToClose !== '' && 
      data.preQualified !== '';
    setIsValid(isValid);
  }, [data, setIsValid]);

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
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pre-qualified */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Pre-qualified for Financing? <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {preQualifiedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateData({ preQualified: opt.value })}
                className={`p-4 rounded-lg border transition-all text-center ${
                  data.preQualified === opt.value
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
