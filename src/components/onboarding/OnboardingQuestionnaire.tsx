import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ContactStep } from './steps/ContactStep';
import { BusinessStep } from './steps/BusinessStep';
import { GoalsStep } from './steps/GoalsStep';
import { CriteriaStep } from './steps/CriteriaStep';
import { TechStep } from './steps/TechStep';
import { MarketingStep } from './steps/MarketingStep';

export interface OnboardingData {
  // Contact Information
  fullName: string;
  companyName: string;
  phoneNumber: string;
  linkedinUrl: string;
  
  // About Their Business
  ownsBusiness: boolean | null;
  businessType: string;
  annualRevenue: string;
  annualProfit: string;
  
  // Acquisition Goals
  acquisitionGoal: string;
  idealBusinessTypes: string[];
  industriesOfInterest: string[];
  
  // Deal Criteria
  ttmRevenueMin: number;
  ttmRevenueMax: number;
  ttmProfitMin: number;
  ttmProfitMax: number;
  askingPriceMin: number;
  askingPriceMax: number;
  profitMultipleMin: number;
  profitMultipleMax: number;
  
  // Tech Preferences
  preferredTechStacks: string[];
  
  // Marketing
  referralSource: string;
  referralOtherDetails: string;
}

const OnboardingQuestionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    companyName: '',
    phoneNumber: '',
    linkedinUrl: '',
    ownsBusiness: null,
    businessType: '',
    annualRevenue: '',
    annualProfit: '',
    acquisitionGoal: '',
    idealBusinessTypes: [],
    industriesOfInterest: [],
    ttmRevenueMin: 0,
    ttmRevenueMax: 10000000,
    ttmProfitMin: 0,
    ttmProfitMax: 5000000,
    askingPriceMin: 0,
    askingPriceMax: 50000000,
    profitMultipleMin: 1,
    profitMultipleMax: 10,
    preferredTechStacks: [],
    referralSource: '',
    referralOtherDetails: '',
  });

  const steps = [
    { title: 'Contact Information', component: ContactStep },
    { title: 'About Your Business', component: BusinessStep },
    { title: 'Acquisition Goals', component: GoalsStep },
    { title: 'Deal Criteria', component: CriteriaStep },
    { title: 'Tech Preferences', component: TechStep },
    { title: 'How Did You Hear About Us?', component: MarketingStep },
  ];

  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData.component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Convert data to database format
      const onboardingData = {
        user_id: user.id,
        full_name: data.fullName,
        company_name: data.companyName,
        phone_number: data.phoneNumber,
        linkedin_url: data.linkedinUrl,
        owns_business: data.ownsBusiness,
        business_type: (data.businessType as 'saas' | 'ecom' | 'agency' | 'other') || null,
        annual_revenue: data.annualRevenue,
        annual_profit: data.annualProfit,
        acquisition_goal: data.acquisitionGoal as 'buy_businesses' | 'minority_partner' | 'explore_options' | null,
        ideal_business_types: data.idealBusinessTypes as ('saas' | 'ecom' | 'agency' | 'other')[],
        industries_of_interest: data.industriesOfInterest,
        ttm_revenue_min: data.ttmRevenueMin,
        ttm_revenue_max: data.ttmRevenueMax,
        ttm_profit_min: data.ttmProfitMin,
        ttm_profit_max: data.ttmProfitMax,
        asking_price_min: data.askingPriceMin,
        asking_price_max: data.askingPriceMax,
        profit_multiple_min: data.profitMultipleMin,
        profit_multiple_max: data.profitMultipleMax,
        preferred_tech_stacks: data.preferredTechStacks,
        referral_source: data.referralSource as 'referral' | 'social_media' | 'search' | 'other' | null,
        referral_other_details: data.referralOtherDetails,
        completed_at: new Date().toISOString(),
      };

      const { error: onboardingError } = await supabase
        .from('onboarding_responses')
        .upsert(onboardingData);

      if (onboardingError) throw onboardingError;

      // Update profile to mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Onboarding Complete!",
        description: "Welcome to EBB Data Room. You can now access investment opportunities.",
      });

      navigate('/investor-portal');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">EBB Data Room</span>
        </div>
        <Button variant="ghost" className="text-gray-600">
          Exit
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl">
          <CurrentStepComponent 
            data={data} 
            updateData={updateData}
          />
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-12">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-gray-600"
            >
              Back
            </Button>
            
            <div className="flex gap-3">
              {currentStep < steps.length - 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="text-gray-500"
                >
                  Skip
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-2 rounded-lg"
              >
                {loading ? 'Saving...' : currentStep === steps.length - 1 ? 'Complete' : 'Next →'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="h-2 bg-gray-100">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;