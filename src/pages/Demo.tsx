
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Inbox } from 'lucide-react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import OverviewTab from '@/components/investor/OverviewTab';
import DealDetailView from '@/components/investor/DealDetailView';
import { useInvestorDeals } from '@/hooks/useInvestorDeals';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Demo = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    selectedDeal,
    selectedDealData,
    viewMode,
    handleFilterChange,
    handleDealClick,
    handleBackToDashboard,
    resetFilters,
  } = useInvestorDeals();

  // Fetch real deals from database filtered to exclude test data
  const { data: realDeals = [], isLoading } = useQuery({
    queryKey: ['demo-real-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          company_name,
          industry,
          revenue,
          ebitda,
          current_stage,
          status,
          priority,
          location,
          description,
          founded_year,
          team_size,
          reason_for_sale,
          growth_opportunities,
          founders_message,
          founder_name,
          ideal_buyer_profile,
          rollup_potential,
          market_trends_alignment,
          profit_margin,
          customer_count,
          recurring_revenue,
          cac_ltv_ratio,
          updated_at
        `)
        .eq('is_test_data', false)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Map to the expected format for OverviewTab
      return (data || []).map(deal => ({
        id: deal.id,
        companyName: deal.company_name,
        industry: deal.industry || 'N/A',
        revenue: deal.revenue || 'N/A',
        ebitda: deal.ebitda || 'N/A',
        stage: deal.current_stage || deal.status || 'Active',
        progress: 50, // Would need real calculation
        priority: deal.priority || 'Medium',
        location: deal.location || 'N/A',
        fitScore: 85, // Would need real calculation
        lastUpdated: deal.updated_at,
        description: deal.description || '',
        foundedYear: deal.founded_year?.toString() || '',
        teamSize: deal.team_size || '',
        reasonForSale: deal.reason_for_sale || '',
        growthOpportunities: Array.isArray(deal.growth_opportunities) 
          ? deal.growth_opportunities as string[]
          : [],
        foundersMessage: deal.founders_message || '',
        founderName: deal.founder_name || '',
        idealBuyerProfile: deal.ideal_buyer_profile || '',
        rollupPotential: deal.rollup_potential || '',
        marketTrends: deal.market_trends_alignment || '',
        profitMargin: deal.profit_margin || '',
        customerCount: deal.customer_count || '',
        recurringRevenue: deal.recurring_revenue || '',
        cacLtvRatio: deal.cac_ltv_ratio || '',
        highlights: [] as string[],
        risks: [] as string[],
        documents: [] as { name: string; type: string; size: string; lastUpdated: string }[],
        createdAt: deal.updated_at
      }));
    },
  });

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

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : realDeals.length === 0 ? (
              <div className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] p-12 rounded-2xl border border-[#D4AF37]/30 text-center">
                <Inbox className="w-16 h-16 text-[#D4AF37]/50 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">
                  No Deals Available
                </h3>
                <p className="text-[#F4E4BC]/70">
                  There are currently no active deals to display.
                </p>
              </div>
            ) : (
              <OverviewTab
                allDeals={realDeals}
                filteredDeals={realDeals}
                selectedDeal={selectedDeal}
                onFilterChange={handleFilterChange}
                onDealClick={handleDealClick}
                onResetFilters={resetFilters}
              />
            )}
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
