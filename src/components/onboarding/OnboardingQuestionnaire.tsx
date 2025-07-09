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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to EBB Data Room
            </CardTitle>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Step {currentStep + 1} of {steps.length}: {currentStepData.title}
              </p>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <CurrentStepComponent 
              data={data} 
              updateData={updateData}
            />
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              
              <div className="flex gap-2">
                {currentStep < steps.length - 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                  >
                    Skip
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;