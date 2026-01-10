import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { DealSelector } from '@/components/data-room/DealSelector';

const DataRoom = () => {
  const navigate = useNavigate();

  // Navigate to Deal Workspace Data Room tab when a deal is selected
  const handleDealSelect = (dealId: string) => {
    navigate(`/deals/${dealId}?tab=data-room`);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Data Room', href: '/data-room' },
  ];

  return (
    <AdminDashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Room</h1>
          <p className="text-muted-foreground mt-1">
            Select a deal to access its secure document repository
          </p>
        </div>
        <DealSelector onSelect={handleDealSelect} />
      </div>
    </AdminDashboardLayout>
  );
};

export default DataRoom;
