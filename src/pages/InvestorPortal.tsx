import React from 'react';
import { InvestorContextProvider } from '@/hooks/useInvestorContext';
import InvestorPortalMain from '@/components/investor/InvestorPortalMain';

const InvestorPortal = () => {
  return (
    <InvestorContextProvider>
      <InvestorPortalMain />
    </InvestorContextProvider>
  );
};

export default InvestorPortal;