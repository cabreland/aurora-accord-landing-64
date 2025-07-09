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
        <div className="inline-flex items-center justify-center w-20 h-20 gradient-secondary rounded-full mb-6 animate-bounce-slow">
          <span className="text-3xl">🏢</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Do you currently own or operate a business?
        </h1>
      </div>
      
      <div className="space-y-8">
        <div className="flex gap-4 justify-center">
          <Button
            variant={data.ownsBusiness === true ? "default" : "outline"}
            onClick={() => updateData({ ownsBusiness: true })}
            className={`h-16 px-12 text-lg rounded-xl transition-all duration-200 transform hover:scale-105 ${
              data.ownsBusiness === true 
                ? 'gradient-primary text-white shadow-lg' 
                : 'border-2 border-purple-200 hover:border-purple-400 bg-white/80'
            }`}
          >
            ✅ Yes
          </Button>
          <Button
            variant={data.ownsBusiness === false ? "default" : "outline"}
            onClick={() => updateData({ ownsBusiness: false })}
            className={`h-16 px-12 text-lg rounded-xl transition-all duration-200 transform hover:scale-105 ${
              data.ownsBusiness === false 
                ? 'gradient-primary text-white shadow-lg' 
                : 'border-2 border-purple-200 hover:border-purple-400 bg-white/80'
            }`}
          >
            ❌ No
          </Button>
        </div>
        
        {data.ownsBusiness && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                What type of business is it?
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {businessTypeOptions.map((type, index) => {
                const IconComponent = type.icon;
                const colors = ['purple', 'blue', 'emerald', 'yellow'];
                const color = colors[index % colors.length];
                return (
                  <Button
                    key={type.value}
                    variant={data.businessType === type.value ? "default" : "outline"}
                    onClick={() => updateData({ businessType: type.value })}
                    className={`h-24 flex flex-col items-center gap-3 text-lg rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      data.businessType === type.value 
                        ? `gradient-${color === 'yellow' ? 'warm' : 'primary'} text-white shadow-lg` 
                        : `border-2 border-${color}-200 hover:border-${color}-400 bg-white/80`
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  value={data.annualRevenue}
                  onChange={(e) => updateData({ annualRevenue: e.target.value })}
                  placeholder="💰 Approximate annual revenue"
                  className="h-16 text-lg border-2 border-emerald-100 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
              
              <div className="relative group">
                <Input
                  value={data.annualProfit}
                  onChange={(e) => updateData({ annualProfit: e.target.value })}
                  placeholder="📈 Approximate annual profit"
                  className="h-16 text-lg border-2 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};