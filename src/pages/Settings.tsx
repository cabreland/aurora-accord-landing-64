
import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import UnifiedSettingsLayout from '@/components/settings/UnifiedSettingsLayout';

const SettingsPage = () => {
  return (
    <DashboardLayout activeTab="settings">
      <UnifiedSettingsLayout />
    </DashboardLayout>
  );
};

export default SettingsPage;
