import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import UserManagement from '@/components/admin/UserManagement';

const UserManagementPage = () => {
  return (
    <DashboardLayout activeTab="users">
      <UserManagement />
    </DashboardLayout>
  );
};

export default UserManagementPage;