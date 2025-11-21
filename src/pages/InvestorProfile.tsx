import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { InvestorProfileSettings } from '@/components/investor/InvestorProfileSettings';

const InvestorProfile = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <InvestorProfileSettings />
      </div>
    </DashboardLayout>
  );
};

export default InvestorProfile;
