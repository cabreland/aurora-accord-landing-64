import { useState } from 'react';
import { mockDeals, MockDeal } from '@/data/mockDeals';

interface FilterCriteria {
  industry?: string;
  stage?: string;
  priority?: string;
  minRevenue?: number;
}

export const useDealsFilter = () => {
  const [filteredDeals, setFilteredDeals] = useState<MockDeal[]>(mockDeals);
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'detail'>('dashboard');

  const handleFilterChange = (filters: FilterCriteria) => {
    let filtered = mockDeals;
    
    if (filters.industry && filters.industry !== 'all') {
      filtered = filtered.filter(deal => deal.industry.toLowerCase() === filters.industry!.toLowerCase());
    }
    
    if (filters.stage && filters.stage !== 'all') {
      filtered = filtered.filter(deal => deal.stage === filters.stage);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(deal => deal.priority === filters.priority);
    }
    
    if (filters.minRevenue) {
      filtered = filtered.filter(deal => {
        const revenue = parseFloat(deal.revenue.replace('$', '').replace('M', ''));
        return revenue >= filters.minRevenue!;
      });
    }
    
    setFilteredDeals(filtered);
  };

  const handleDealClick = (dealId: number) => {
    setSelectedDeal(dealId);
    setViewMode('detail');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedDeal(null);
  };

  const resetFilters = () => {
    setFilteredDeals(mockDeals);
  };

  const selectedDealData = mockDeals.find(deal => deal.id === selectedDeal);

  return {
    filteredDeals,
    selectedDeal,
    selectedDealData,
    viewMode,
    handleFilterChange,
    handleDealClick,
    handleBackToDashboard,
    resetFilters,
    allDeals: mockDeals
  };
};