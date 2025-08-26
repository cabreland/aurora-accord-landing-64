
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './OverviewTab';
import { InvestorDeal } from '@/hooks/useInvestorDeals';

interface PortalTabsProps {
  allDeals: InvestorDeal[];
  filteredDeals: InvestorDeal[];
  selectedDeal: string | null;
  loading?: boolean;
  onFilterChange: (filters: any) => void;
  onDealClick: (dealId: string | number) => void;
  onResetFilters: () => void;
  onRefresh?: () => void;
}

const PortalTabs = ({ 
  allDeals, 
  filteredDeals, 
  selectedDeal, 
  loading = false,
  onFilterChange, 
  onDealClick, 
  onResetFilters,
  onRefresh
}: PortalTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-[#2A2F3A] border border-[#D4AF37]/20">
        <TabsTrigger 
          value="overview" 
          className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="deals" 
          className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
        >
          Active Deals
        </TabsTrigger>
        <TabsTrigger 
          value="documents" 
          className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
        >
          Documents
        </TabsTrigger>
        <TabsTrigger 
          value="watchlist" 
          className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
        >
          Watchlist
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-8">
        <OverviewTab 
          allDeals={allDeals}
          filteredDeals={filteredDeals}
          selectedDeal={selectedDeal}
          loading={loading}
          onFilterChange={onFilterChange}
          onDealClick={onDealClick}
          onResetFilters={onResetFilters}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="deals" className="mt-8">
        <OverviewTab 
          allDeals={allDeals}
          filteredDeals={filteredDeals}
          selectedDeal={selectedDeal}
          loading={loading}
          onFilterChange={onFilterChange}
          onDealClick={onDealClick}
          onResetFilters={onResetFilters}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="documents" className="mt-8">
        <div className="text-center py-12">
          <div className="text-[#F4E4BC] text-xl mb-4">Document Center</div>
          <p className="text-[#F4E4BC]/60">Access and manage deal documents</p>
        </div>
      </TabsContent>

      <TabsContent value="watchlist" className="mt-8">
        <div className="text-center py-12">
          <div className="text-[#F4E4BC] text-xl mb-4">Your Watchlist</div>
          <p className="text-[#F4E4BC]/60">Track deals you're interested in</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PortalTabs;
