import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Building, Phone, Linkedin } from 'lucide-react';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface ContactStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export const ContactStep = ({ data, updateData }: ContactStepProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Let's get to know you
        </h1>
        <p className="text-xl text-gray-600">
          Tell us a bit about yourself to personalize your experience
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <User className="w-5 h-5" />
          </div>
          <Input
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="Full name*"
            className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Building className="w-5 h-5" />
          </div>
          <Input
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            placeholder="Company name (optional)"
            className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Phone className="w-5 h-5" />
          </div>
          <Input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
            placeholder="Phone number"
            className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Linkedin className="w-5 h-5" />
          </div>
          <Input
            type="url"
            value={data.linkedinUrl}
            onChange={(e) => updateData({ linkedinUrl: e.target.value })}
            placeholder="LinkedIn profile URL"
            className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};