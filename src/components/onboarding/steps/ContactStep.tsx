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
        <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-full mb-6 animate-float">
          <span className="text-3xl">👋</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Let's get to know you
        </h1>
        <p className="text-xl text-gray-600">
          Tell us a bit about yourself to personalize your experience
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-focus-within:text-purple-600 transition-colors">
            <User className="w-5 h-5" />
          </div>
          <Input
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="Full name*"
            className="pl-12 h-16 text-lg border-2 border-purple-100 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-200"
            required
          />
        </div>
        
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors">
            <Building className="w-5 h-5" />
          </div>
          <Input
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            placeholder="Company name (optional)"
            className="pl-12 h-16 text-lg border-2 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-200"
          />
        </div>
        
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <Input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
            placeholder="Phone number"
            className="pl-12 h-16 text-lg border-2 border-emerald-100 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-200"
          />
        </div>
        
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500 group-focus-within:text-yellow-600 transition-colors">
            <Linkedin className="w-5 h-5" />
          </div>
          <Input
            type="url"
            value={data.linkedinUrl}
            onChange={(e) => updateData({ linkedinUrl: e.target.value })}
            placeholder="LinkedIn profile URL"
            className="pl-12 h-16 text-lg border-2 border-yellow-100 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};