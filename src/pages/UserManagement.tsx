import React from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import UserManagement from '@/components/admin/UserManagement';

const UserManagementPage = () => {
  return (
    <AdminDashboardLayout activeTab="users">
      <UserManagement />
    </AdminDashboardLayout>
  );
};

export default UserManagementPage;