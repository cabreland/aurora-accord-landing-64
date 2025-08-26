
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock } from 'lucide-react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import OverviewTab from '@/components/investor/OverviewTab';
import DealDetailView from '@/components/investor/DealDetailView';
import { mockDeals } from '@/data/mockDeals';
import { useInvestorDeals } from '@/hooks/useInvestorDeals';

const Demo = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    filteredDeals,
    selectedDeal,
    selectedDealData,
    viewMode,
    handleFilterChange,
    handleDealClick,
    handleBackToDashboard,
    resetFilters,
    allDeals: mockDealsData
  } = useInvestorDeals();

  // Convert mock deals to InvestorDeal format for the demo
  const convertedMockDeals = mockDeals.map(deal => ({
    ...deal,
    id: deal.id
  }));

  const renderDemoContent = () => {
    if (viewMode === 'detail' && selectedDealData) {
      return (
        <DealDetailView
          deal={selectedDealData}
          onBack={handleBackToDashboard}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Demo Header */}
            <div className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] p-8 rounded-2xl border border-[#D4AF37]/30">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-[#FAFAFA] mb-4">
                    Data Room Portal
                  </h1>
                  <p className="text-xl text-[#F4E4BC] max-w-2xl">
                    Comprehensive deal and document management platform
                  </p>
                  <p className="text-sm text-[#F4E4BC]/70 mt-2">
                    Welcome to the demo, Demo User
                  </p>
                </div>
                <div className="mt-6 lg:mt-0 flex items-center gap-4">
                  <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] font-bold px-6 py-3 text-base">
                    Demo Viewer
                  </Badge>
                  <Link to="/auth">
                    <Button
                      variant="outline"
                      className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
                    >
                      Get Real Access
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <OverviewTab
              allDeals={convertedMockDeals}
              filteredDeals={convertedMockDeals}
              selectedDeal={selectedDeal}
              onFilterChange={handleFilterChange}
              onDealClick={handleDealClick}
              onResetFilters={resetFilters}
            />
          </div>
        );
      case 'deals':
      case 'documents':
      case 'users':
      case 'settings':
        return (
          <div className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] p-8 rounded-2xl border border-[#D4AF37]/30 text-center">
            <Lock className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[#FAFAFA] mb-4">
              Full Access Required
            </h3>
            <p className="text-[#F4E4BC] mb-6 max-w-md mx-auto">
              This section requires authentication. Sign up to access all features of the investor portal.
            </p>
            <Link to="/auth">
              <Button className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold">
                Get Access
              </Button>
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1C2526]">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] p-4 text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="text-[#0A0F0F] font-bold">🚀 Demo Mode</span>
          <span className="text-[#0A0F0F]">You're viewing a preview of the investor portal</span>
          <Link to="/auth">
            <Button size="sm" variant="outline" className="border-[#0A0F0F] text-[#0A0F0F] hover:bg-[#0A0F0F] hover:text-[#D4AF37]">
              Sign Up for Full Access
            </Button>
          </Link>
        </div>
      </div>

      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderDemoContent()}
      </DashboardLayout>
    </div>
  );
};

export default Demo;
