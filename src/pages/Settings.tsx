
import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import SettingsManager from '@/components/settings/SettingsManager';

const SettingsPage = () => {
  return (
    <DashboardLayout activeTab="settings">
      <SettingsManager />
    </DashboardLayout>
  );
};

export default SettingsPage;
