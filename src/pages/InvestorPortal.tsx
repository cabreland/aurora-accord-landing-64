import React from 'react';
import { InvestorContextProvider } from '@/hooks/useInvestorContext';
import InvestorPortalMain from '@/components/investor/InvestorPortalMain';
import { OnboardingBanner } from '@/components/investor/OnboardingBanner';

const InvestorPortal = () => {
  return (
    <InvestorContextProvider>
      <OnboardingBanner />
      <InvestorPortalMain />
    </InvestorContextProvider>
  );
};

export default InvestorPortal;