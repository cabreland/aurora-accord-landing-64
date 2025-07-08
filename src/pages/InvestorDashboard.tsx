
import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import DealDetailView from '@/components/investor/DealDetailView';
import PortalHeader from '@/components/investor/PortalHeader';
import PortalTabs from '@/components/investor/PortalTabs';
import { useDealsFilter } from '@/hooks/useDealsFilter';

const InvestorDashboard = () => {
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

  if (viewMode === 'detail' && selectedDealData) {
    return (
      <div className="min-h-screen bg-[#1C2526]">
        <DashboardLayout>
          <DealDetailView deal={selectedDealData} onBack={handleBackToDashboard} />
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C2526]">
      <DashboardLayout>
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
      </DashboardLayout>
    </div>
  );
};

export default InvestorDashboard;
