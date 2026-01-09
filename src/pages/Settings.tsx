import React from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import UnifiedSettingsLayout from '@/components/settings/UnifiedSettingsLayout';

const SettingsPage = () => {
  return (
    <AdminDashboardLayout activeTab="settings">
      <UnifiedSettingsLayout />
    </AdminDashboardLayout>
  );
};

export default SettingsPage;
