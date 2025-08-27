
import { useState, useEffect } from 'react';
import { getPublishedTeasers, TeaserData } from '@/lib/data/teasers';
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
      const teasers = await getPublishedTeasers();
      const deals = teasers.map(convertTeaserToDeal);
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

// Convert teaser data to deal format for investor view
const convertTeaserToDeal = (teaser: TeaserData): InvestorDeal => {
  return {
    id: teaser.id,
    companyName: teaser.name || 'Unnamed Company',
    industry: teaser.industry || 'Not specified',
    revenue: teaser.revenue || 'Not disclosed',
    ebitda: teaser.ebitda || 'Not disclosed',
    stage: mapStageToDisplay(teaser.stage),
    progress: calculateProgress(teaser.stage),
    priority: capitalizeFirst(teaser.priority || 'medium'),
    location: teaser.location || 'Not specified',
    fitScore: teaser.fit_score || 50,
    lastUpdated: formatDate(teaser.updated_at),
    description: teaser.summary || 'No description available',
    // Extended fields - using fallbacks since they're teaser-only
    foundedYear: 'Not specified',
    teamSize: 'Not specified',
    reasonForSale: 'Not specified',
    growthOpportunities: [],
    foundersMessage: '',
    founderName: 'Not specified',
    idealBuyerProfile: '',
    rollupPotential: '',
    marketTrends: '',
    profitMargin: 'Not disclosed',
    customerCount: 'Not disclosed',
    recurringRevenue: 'Not disclosed',
    cacLtvRatio: 'Not disclosed',
    highlights: (teaser.teaser_payload?.highlights as string[]) || [],
    risks: (teaser.teaser_payload?.risks as string[]) || [],
    documents: []
  };
};

const mapStageToDisplay = (stage?: string) => {
  switch (stage) {
    case 'teaser': return 'Initial Review';
    case 'discovery': return 'NDA Signed';
    case 'dd': return 'Due Diligence';
    case 'closing': return 'Closing';
    default: return 'Initial Review';
  }
};

const calculateProgress = (stage?: string) => {
  switch (stage) {
    case 'teaser': return 25;
    case 'discovery': return 50;
    case 'dd': return 75;
    case 'closing': return 90;
    default: return 25;
  }
};

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
};
