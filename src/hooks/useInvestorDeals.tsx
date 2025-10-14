import { useState, useEffect } from 'react';
import { getPublishedTeasers, TeaserData } from '@/lib/data/teasers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getAccessibleDeals, AccessibleDeal, logInvestorActivity } from '@/lib/rpc/investorDealAccess';
import { supabase } from '@/integrations/supabase/client';

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
  createdAt: string; // Add actual date for filtering
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
  watchlistOnly?: boolean;
  ndaOnly?: boolean;
  newThisWeek?: boolean;
}

export const useInvestorDeals = () => {
  const { user } = useAuth();
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
      if (!user?.email) {
        console.warn('No user email, using fallback teaser data');
        // Fallback to published teasers if no user context
        const teasers = await getPublishedTeasers();
        const deals = teasers.map(convertTeaserToDeal);
        setAllDeals(deals);
        setFilteredDeals(deals);
        return;
      }

      // Get permission-based accessible deals
      const accessibleDeals = await getAccessibleDeals(user.email);
      
      if (accessibleDeals.length === 0) {
        console.warn('No accessible deals found, using fallback teaser data');
        // Fallback to published teasers if no accessible deals
        const teasers = await getPublishedTeasers();
        const deals = teasers.map(convertTeaserToDeal);
        setAllDeals(deals);
        setFilteredDeals(deals);
        return;
      }

      // Convert accessible deals to investor deal format
      const deals = accessibleDeals.map(convertAccessibleDealToInvestorDeal);
      setAllDeals(deals);
      setFilteredDeals(deals);

      // Log activity
      await logInvestorActivity(user.email, 'deals_viewed', undefined, {
        deal_count: deals.length,
        access_type: 'permission_based'
      });
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

  const handleFilterChange = async (filters: FilterCriteria) => {
    let filtered = allDeals;
    
    // Watchlist filter
    if (filters.watchlistOnly && user?.id) {
      const { data: watchlistData } = await supabase
        .from('deal_watchlist')
        .select('deal_id')
        .eq('user_id', user.id);
      
      const watchlistIds = new Set(watchlistData?.map(w => w.deal_id) || []);
      filtered = filtered.filter(deal => watchlistIds.has(deal.id));
    }
    
    // NDA filter
    if (filters.ndaOnly && user?.id) {
      const { data: ndaData } = await supabase
        .from('company_nda_acceptances')
        .select('company_id')
        .eq('user_id', user.id);
      
      const ndaCompanyIds = new Set(ndaData?.map(n => n.company_id) || []);
      filtered = filtered.filter(deal => ndaCompanyIds.has(deal.id));
    }
    
    // New this week filter
    if (filters.newThisWeek) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      filtered = filtered.filter(deal => {
        const dealDate = new Date(deal.createdAt);
        return dealDate >= oneWeekAgo;
      });
    }
    
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

  const handleDealClick = async (dealId: string | number) => {
    const stringId = typeof dealId === 'number' ? dealId.toString() : dealId;
    setSelectedDeal(stringId);
    setViewMode('detail');

    // Log deal view activity
    if (user?.email) {
      await logInvestorActivity(user.email, 'deal_viewed', stringId, {
        deal_name: allDeals.find(d => d.id === stringId)?.companyName
      });
    }
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
    createdAt: teaser.created_at || new Date().toISOString(),
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

// Convert AccessibleDeal to InvestorDeal format
const convertAccessibleDealToInvestorDeal = (deal: AccessibleDeal): InvestorDeal => {
  return {
    id: deal.id || '',
    companyName: deal.company_name || 'Unnamed Company',
    industry: deal.industry || 'Not specified',
    revenue: deal.revenue || 'Not disclosed',
    ebitda: deal.ebitda || 'Not disclosed',
    stage: mapStageToDisplay(deal.status),
    progress: calculateProgress(deal.status),
    priority: capitalizeFirst(deal.priority || 'medium'),
    location: deal.location || 'Not specified',
    fitScore: 85, // Default fit score for permission-based deals
    lastUpdated: formatDate(deal.updated_at),
    createdAt: deal.created_at || new Date().toISOString(),
    description: deal.description || 'No description available',
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
    highlights: [],
    risks: [],
    documents: []
  };
};

const mapStageToDisplay = (stage?: string) => {
  switch (stage) {
    case 'teaser': return 'Initial Review';
    case 'discovery': return 'NDA Signed';
    case 'dd': return 'Due Diligence';
    case 'closing': return 'Closing';
    case 'active': return 'Active Deal';
    case 'draft': return 'Draft';
    case 'archived': return 'Archived';
    default: return 'Initial Review';
  }
};

const calculateProgress = (stage?: string) => {
  switch (stage) {
    case 'teaser': return 25;
    case 'discovery': return 50;
    case 'dd': return 75;
    case 'closing': return 90;
    case 'active': return 60;
    case 'draft': return 10;
    case 'archived': return 100;
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