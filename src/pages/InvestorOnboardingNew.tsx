import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ContactInfoStep } from '@/components/onboarding/steps/ContactInfoStep';
import { InvestmentCriteriaStep } from '@/components/onboarding/steps/InvestmentCriteriaStep';
import { DealPreferencesStep } from '@/components/onboarding/steps/DealPreferencesStep';
import { FundingDetailsStep } from '@/components/onboarding/steps/FundingDetailsStep';

export interface OnboardingFormData {
  // Step 1: Contact Info
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  linkedinUrl: string;
  
  // Step 2: Investment Criteria
  targetIndustries: string[];
  minInvestment: string;
  maxInvestment: string;
  revenueRange: string;
  ebitdaRange: string;
  geographicPreference: string;
  
  // Step 3: Deal Preferences
  primaryGoal: string;
  mustHaves: string[];
  dealBreakers: string[];
  communicationPreference: string;
  
  // Step 4: Funding Details
  fundingType: string;
  timelineToClose: string;
  preQualified: string;
  referralSource: string;
  referralDetails: string;
}

const initialFormData: OnboardingFormData = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  linkedinUrl: '',
  targetIndustries: [],
  minInvestment: '',
  maxInvestment: '',
  revenueRange: '',
  ebitdaRange: '',
  geographicPreference: '',
  primaryGoal: '',
  mustHaves: [],
  dealBreakers: [],
  communicationPreference: '',
  fundingType: '',
  timelineToClose: '',
  preQualified: '',
  referralSource: '',
  referralDetails: '',
};

const InvestorOnboardingNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loadingChecklist, setLoadingChecklist] = useState<string[]>([]);

  const totalSteps = 4;

  // Pre-fill email from auth
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleContinue = async () => {
    if (!isValid) {
      toast({
        title: "Please complete all required fields",
        description: "All fields marked as required must be filled in.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit form
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // Animate checklist
    const checklistItems = [
      'Saving your preferences',
      'Configuring deal matching',
      'Setting up your data room access',
      'Preparing your dashboard',
    ];
    
    for (let i = 0; i < checklistItems.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingChecklist(prev => [...prev, checklistItems[i]]);
    }

    try {
      // Save to investor_profiles
      const { error: profileError } = await supabase
        .from('investor_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.companyName,
          linkedin_url: formData.linkedinUrl || null,
          target_industries: formData.targetIndustries,
          min_investment: formData.minInvestment,
          max_investment: formData.maxInvestment,
          revenue_range_preference: formData.revenueRange,
          ebitda_range_preference: formData.ebitdaRange,
          geographic_preference: formData.geographicPreference,
          primary_goal: formData.primaryGoal,
          must_haves: formData.mustHaves,
          deal_breakers: formData.dealBreakers,
          communication_preference: formData.communicationPreference,
          funding_type: formData.fundingType,
          timeline_to_close: formData.timelineToClose,
          pre_qualified: formData.preQualified,
          referral_source: formData.referralSource || null,
          referral_details: formData.referralDetails || null,
        });

      if (profileError) throw profileError;

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          first_name: formData.fullName.split(' ')[0],
          last_name: formData.fullName.split(' ').slice(1).join(' '),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Show complete state
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
      setIsComplete(true);

      // Redirect after delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/investor-portal');

    } catch (error: any) {
      console.error('Onboarding error:', error);
      setIsLoading(false);
      toast({
        title: "Error saving profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Prevent navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 1 && !isComplete) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, isComplete]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Setting up your profile...</h2>
          <div className="space-y-3">
            {loadingChecklist.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-gray-700"
              >
                <Check className="w-5 h-5 text-green-500" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All Set!</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Exclusive Business Brokers
          </h1>
          <p className="text-gray-600 text-lg">
            Let's find your perfect acquisition opportunity
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                  index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : index + 1 === currentStep
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1 < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#D4AF37]"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-center text-gray-500 mt-2 text-sm">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <ContactInfoStep
                  data={formData}
                  updateData={updateFormData}
                  setIsValid={setIsValid}
                />
              )}
              {currentStep === 2 && (
                <InvestmentCriteriaStep
                  data={formData}
                  updateData={updateFormData}
                  setIsValid={setIsValid}
                />
              )}
              {currentStep === 3 && (
                <DealPreferencesStep
                  data={formData}
                  updateData={updateFormData}
                  setIsValid={setIsValid}
                />
              )}
              {currentStep === 4 && (
                <FundingDetailsStep
                  data={formData}
                  updateData={updateFormData}
                  setIsValid={setIsValid}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Continue Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
            <Button
              onClick={handleContinue}
              disabled={!isValid}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isValid
                  ? 'bg-[#D4AF37] hover:bg-[#C9A432] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === totalSteps ? 'Complete' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorOnboardingNew;
