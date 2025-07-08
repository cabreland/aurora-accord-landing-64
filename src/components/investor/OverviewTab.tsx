import React from 'react';
import { Button } from '@/components/ui/button';
import DealMetrics from '@/components/investor/DealMetrics';
import DealFilters from '@/components/investor/DealFilters';
import DealCard from '@/components/investor/DealCard';
import { MockDeal } from '@/data/mockDeals';

interface OverviewTabProps {
  allDeals: MockDeal[];
  filteredDeals: MockDeal[];
  selectedDeal: number | null;
  onFilterChange: (filters: any) => void;
  onDealClick: (dealId: number) => void;
  onResetFilters: () => void;
}

const OverviewTab = ({ 
  allDeals, 
  filteredDeals, 
  selectedDeal, 
  onFilterChange, 
  onDealClick, 
  onResetFilters 
}: OverviewTabProps) => {
  return (
    <div className="space-y-8">
      {/* Metrics Overview */}
      <DealMetrics deals={allDeals} />

      {/* Filters */}
      <DealFilters onFilterChange={onFilterChange} />

      {/* Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onClick={() => onDealClick(deal.id)}
            isSelected={selectedDeal === deal.id}
          />
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[#F4E4BC] text-xl mb-4">No deals match your current filters</div>
          <Button 
            onClick={onResetFilters}
            className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;