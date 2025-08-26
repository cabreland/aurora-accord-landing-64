
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import DealMetrics from '@/components/investor/DealMetrics';
import DealFilters from '@/components/investor/DealFilters';
import DealCard from '@/components/investor/DealCard';
import { Skeleton } from '@/components/ui/skeleton';
import { InvestorDeal } from '@/hooks/useInvestorDeals';

interface OverviewTabProps {
  allDeals: InvestorDeal[];
  filteredDeals: InvestorDeal[];
  selectedDeal: string | null;
  loading?: boolean;
  onFilterChange: (filters: any) => void;
  onDealClick: (dealId: string | number) => void;
  onResetFilters: () => void;
  onRefresh?: () => void;
}

const OverviewTab = ({ 
  allDeals, 
  filteredDeals, 
  selectedDeal,
  loading = false,
  onFilterChange, 
  onDealClick, 
  onResetFilters,
  onRefresh
}: OverviewTabProps) => {
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#FAFAFA]">Investment Opportunities</h2>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

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

      {filteredDeals.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-[#F4E4BC] text-xl mb-4">
            {allDeals.length === 0 
              ? "No investment opportunities available yet" 
              : "No deals match your current filters"
            }
          </div>
          {allDeals.length > 0 && (
            <Button 
              onClick={onResetFilters}
              className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
