import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './OverviewTab';
import DealsList from '@/components/deals/DealsList';
import DocumentUpload from '@/components/documents/DocumentUpload';
import UserManagement from '@/components/admin/UserManagement';
import { MockDeal } from '@/data/mockDeals';

interface PortalTabsProps {
  filteredDeals: MockDeal[];
  selectedDeal: number | null;
  allDeals: MockDeal[];
  onFilterChange: (filters: any) => void;
  onDealClick: (dealId: number) => void;
  onResetFilters: () => void;
}

const PortalTabs = ({
  filteredDeals,
  selectedDeal,
  allDeals,
  onFilterChange,
  onDealClick,
  onResetFilters
}: PortalTabsProps) => {

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
          onFilterChange={onFilterChange}
          onDealClick={onDealClick}
          onResetFilters={onResetFilters}
        />
      </TabsContent>

      <TabsContent value="deals" className="mt-6">
        <DealsList />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <DocumentUpload dealId="example-deal-id" onUploadComplete={() => {}} />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <UserManagement />
      </TabsContent>
    </Tabs>
  );
};

export default PortalTabs;