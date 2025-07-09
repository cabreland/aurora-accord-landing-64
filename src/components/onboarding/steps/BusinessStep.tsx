import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Server, ShoppingBag, Users, MoreHorizontal } from 'lucide-react';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface BusinessStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const businessTypeOptions = [
  { value: 'saas', label: 'SaaS', icon: Server },
  { value: 'ecom', label: 'E-commerce', icon: ShoppingBag },
  { value: 'agency', label: 'Agency', icon: Users },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

export const BusinessStep = ({ data, updateData }: BusinessStepProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Do you currently own or operate a business?
        </h1>
      </div>
      
      <div className="space-y-8">
        <div className="flex gap-4 justify-center">
          <Button
            variant={data.ownsBusiness === true ? "default" : "outline"}
            onClick={() => updateData({ ownsBusiness: true })}
            className="h-14 px-8 text-lg"
          >
            Yes
          </Button>
          <Button
            variant={data.ownsBusiness === false ? "default" : "outline"}
            onClick={() => updateData({ ownsBusiness: false })}
            className="h-14 px-8 text-lg"
          >
            No
          </Button>
        </div>
        
        {data.ownsBusiness && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                What type of business is it?
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {businessTypeOptions.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={data.businessType === type.value ? "default" : "outline"}
                    onClick={() => updateData({ businessType: type.value })}
                    className="h-20 flex flex-col items-center gap-2 text-lg"
                  >
                    <IconComponent className="w-6 h-6" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                value={data.annualRevenue}
                onChange={(e) => updateData({ annualRevenue: e.target.value })}
                placeholder="Approximate annual revenue"
                className="h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              
              <Input
                value={data.annualProfit}
                onChange={(e) => updateData({ annualProfit: e.target.value })}
                placeholder="Approximate annual profit"
                className="h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};