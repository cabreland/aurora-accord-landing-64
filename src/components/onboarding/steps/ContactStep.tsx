import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface ContactStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export const ContactStep = ({ data, updateData }: ContactStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Contact Information</h2>
        <p className="text-muted-foreground">
          Help us get to know you better. This information helps us provide personalized service.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            placeholder="Your company name (optional)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
          <Input
            id="linkedinUrl"
            type="url"
            value={data.linkedinUrl}
            onChange={(e) => updateData({ linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>
    </div>
  );
};