import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './OverviewTab';
import DealsList from '@/components/deals/DealsList';
import DocumentUpload from '@/components/documents/DocumentUpload';
import { useDealsFilter } from '@/hooks/useDealsFilter';

const PortalTabs = () => {
  const {
    filteredDeals,
    selectedDeal,
    allDeals,
    handleFilterChange,
    handleDealClick,
    resetFilters
  } = useDealsFilter();

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-[#0A0F0F] border border-[#D4AF37]/30">
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
          Deals Management
        </TabsTrigger>
        <TabsTrigger 
          value="documents"
          className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
        >
          Documents
        </TabsTrigger>
        <TabsTrigger 
          value="users"
          className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
        >
          User Management
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab
          allDeals={allDeals}
          filteredDeals={filteredDeals}
          selectedDeal={selectedDeal}
          onFilterChange={handleFilterChange}
          onDealClick={handleDealClick}
          onResetFilters={resetFilters}
        />
      </TabsContent>

      <TabsContent value="deals" className="mt-6">
        <DealsList />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <DocumentUpload dealId="example-deal-id" onUploadComplete={() => {}} />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">User Management</h3>
          <p className="text-[#F4E4BC]">Coming soon - Add, edit, and manage user access to deals.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PortalTabs;