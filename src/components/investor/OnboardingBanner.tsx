import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DISMISSED_KEY = 'onboarding-banner-dismissed';

export const OnboardingBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      // Check if user dismissed the banner
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (dismissed) {
        setIsVisible(false);
        return;
      }

      // Check if onboarding was skipped
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_skipped')
        .eq('user_id', user.id)
        .single();

      if (data?.onboarding_skipped && !data?.onboarding_completed) {
        setIsSkipped(true);
        setIsVisible(true);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  const handleComplete = () => {
    navigate('/investor/onboarding');
  };

  if (!isVisible || !isSkipped) return null;

  return (
    <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#F4E4BC]/10 border-b border-[#D4AF37]/30 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-[#D4AF37]" />
          <p className="text-[#FAFAFA] text-sm">
            📋 Complete your investor profile to get better deal matches and personalized recommendations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleComplete}
            variant="outline"
            size="sm"
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Complete Profile
          </Button>
          <button
            onClick={handleDismiss}
            className="text-[#F4E4BC]/60 hover:text-[#FAFAFA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
