
import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import SettingsManager from '@/components/settings/SettingsManager';
import { withAuth } from '@/utils/withAuth';

const SettingsPage = () => {
  return (
    <DashboardLayout activeTab="settings">
      <SettingsManager />
    </DashboardLayout>
  );
};

export default withAuth('staff')(SettingsPage);
