
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/investor/DashboardLayout';
import DealDetailView from '@/components/investor/DealDetailView';
import PortalHeader from '@/components/investor/PortalHeader';
import PortalTabs from '@/components/investor/PortalTabs';
import UserManagement from '@/components/admin/UserManagement';
import { useInvestorDeals } from '@/hooks/useInvestorDeals';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  useEffect(() => {
    if (!onboardingLoading && onboardingCompleted === false) {
      navigate('/onboarding');
    }
  }, [onboardingCompleted, onboardingLoading, navigate]);

  const {
    filteredDeals,
    selectedDeal,
    selectedDealData,
    viewMode,
    allDeals,
    loading,
    handleFilterChange,
    handleDealClick,
    handleBackToDashboard,
    resetFilters,
    refresh
  } = useInvestorDeals();

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
              loading={loading}
              onFilterChange={handleFilterChange}
              onDealClick={handleDealClick}
              onResetFilters={resetFilters}
              onRefresh={refresh}
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
