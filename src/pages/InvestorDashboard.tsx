
import React, { useState } from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import DealDetailView from '@/components/investor/DealDetailView';
import PortalHeader from '@/components/investor/PortalHeader';
import PortalTabs from '@/components/investor/PortalTabs';
import UserManagement from '@/components/admin/UserManagement';
import { useDealsFilter } from '@/hooks/useDealsFilter';

const InvestorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    filteredDeals,
    selectedDeal,
    selectedDealData,
    viewMode,
    allDeals,
    handleFilterChange,
    handleDealClick,
    handleBackToDashboard,
    resetFilters
  } = useDealsFilter();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'deals':
      case 'documents':
      case 'dashboard':
      default:
        return (
          <div className="space-y-8">
            <PortalHeader />
            <PortalTabs
              filteredDeals={filteredDeals}
              selectedDeal={selectedDeal}
              allDeals={allDeals}
              onFilterChange={handleFilterChange}
              onDealClick={handleDealClick}
              onResetFilters={resetFilters}
            />
          </div>
        );
    }
  };

  if (viewMode === 'detail' && selectedDealData) {
    return (
      <div className="min-h-screen bg-[#1C2526]">
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
          <DealDetailView deal={selectedDealData} onBack={handleBackToDashboard} />
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C2526]">
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </DashboardLayout>
    </div>
  );
};

export default InvestorDashboard;
