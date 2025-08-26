// This file is now deprecated - using useInvestorDeals instead
// Keeping for reference but all functionality moved to useInvestorDeals

export const useDealsFilter = () => {
  console.warn('useDealsFilter is deprecated. Use useInvestorDeals instead.');
  
  return {
    filteredDeals: [],
    selectedDeal: null,
    selectedDealData: null,
    viewMode: 'dashboard' as const,
    handleFilterChange: () => {},
    handleDealClick: () => {},
    handleBackToDashboard: () => {},
    resetFilters: () => {},
    allDeals: []
  };
};
