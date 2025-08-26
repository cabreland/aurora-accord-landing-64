
import { useState, useEffect } from 'react';
import { getCompanies, convertCompanyToDeal, CompanyData } from '@/lib/data/companies';
import { useToast } from '@/hooks/use-toast';

export interface InvestorDeal {
  id: string;
  companyName: string;
  industry: string;
  revenue: string;
  ebitda: string;
  stage: string;
  progress: number;
  priority: string;
  location: string;
  fitScore: number;
  lastUpdated: string;
  description: string;
  foundedYear: string;
  teamSize: string;
  reasonForSale: string;
  growthOpportunities: string[];
  foundersMessage: string;
  founderName: string;
  idealBuyerProfile: string;
  rollupPotential: string;
  marketTrends: string;
  profitMargin: string;
  customerCount: string;
  recurringRevenue: string;
  cacLtvRatio: string;
  highlights: string[];
  risks: string[];
  documents: Array<{
    name: string;
    type: string;
    size: string;
    lastUpdated: string;
  }>;
}

interface FilterCriteria {
  industry?: string;
  stage?: string;
  priority?: string;
  minRevenue?: number;
}

export const useInvestorDeals = () => {
  const [allDeals, setAllDeals] = useState<InvestorDeal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<InvestorDeal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'detail'>('dashboard');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const companies = await getCompanies();
      const deals = companies.map(convertCompanyToDeal);
      setAllDeals(deals);
      setFilteredDeals(deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterCriteria) => {
    let filtered = allDeals;
    
    if (filters.industry && filters.industry !== 'all') {
      filtered = filtered.filter(deal => deal.industry.toLowerCase() === filters.industry!.toLowerCase());
    }
    
    if (filters.stage && filters.stage !== 'all') {
      filtered = filtered.filter(deal => deal.stage === filters.stage);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(deal => deal.priority.toLowerCase() === filters.priority!.toLowerCase());
    }
    
    if (filters.minRevenue) {
      filtered = filtered.filter(deal => {
        const revenue = parseFloat(deal.revenue.replace(/[^0-9.]/g, ''));
        return revenue >= filters.minRevenue!;
      });
    }
    
    setFilteredDeals(filtered);
  };

  const handleDealClick = (dealId: string | number) => {
    const stringId = typeof dealId === 'number' ? dealId.toString() : dealId;
    setSelectedDeal(stringId);
    setViewMode('detail');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedDeal(null);
  };

  const resetFilters = () => {
    setFilteredDeals(allDeals);
  };

  const selectedDealData = allDeals.find(deal => deal.id === selectedDeal);

  const refresh = () => {
    fetchDeals();
  };

  return {
    allDeals,
    filteredDeals,
    selectedDeal,
    selectedDealData,
    viewMode,
    loading,
    handleFilterChange,
    handleDealClick,
    handleBackToDashboard,
    resetFilters,
    refresh
  };
};
