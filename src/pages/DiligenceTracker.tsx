import React from 'react';
import { useParams } from 'react-router-dom';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import DiligenceTrackerDashboard from '@/components/diligence/DiligenceTrackerDashboard';
import DealDiligenceTracker from '@/components/diligence/DealDiligenceTracker';

const DiligenceTracker = () => {
  const { dealId } = useParams<{ dealId: string }>();

  const breadcrumbs = dealId 
    ? [
        { label: 'Due Diligence', href: '/dashboard/diligence-tracker' },
        { label: 'Deal Tracker' }
      ]
    : [
        { label: 'Due Diligence' }
      ];

  return (
    <AdminDashboardLayout activeTab="diligence-tracker" breadcrumbs={breadcrumbs}>
      {dealId ? (
        <DealDiligenceTracker />
      ) : (
        <DiligenceTrackerDashboard />
      )}
    </AdminDashboardLayout>
  );
};

export default DiligenceTracker;
