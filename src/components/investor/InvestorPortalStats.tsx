import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { InvestorDealCard } from '@/components/investor/InvestorDealCard';
import { Search, Star, Eye, FileCheck, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Deal {
  id: string;
  company_name: string;
  industry: string;
  description: string;
  revenue: string;
  ebitda: string;
  asking_price: string;
  location: string;
  created_at: string;
}

interface InvestorStats {
  dealsViewed: number;
  watchlisted: number;
  ndasSigned: number;
  interestsExpressed: number;
}

export const InvestorPortalStats = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState<InvestorStats>({
    dealsViewed: 0,
    watchlisted: 0,
    ndasSigned: 0,
    interestsExpressed: 0
  });

  useEffect(() => {
    loadDeals();
    loadStats();
  }, [sortBy]);

  const loadDeals = async () => {
    let query = supabase
      .from('deals')
      .select('*')
      .eq('status', 'active');

    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'revenue') {
      query = query.order('revenue', { ascending: false });
    } else if (sortBy === 'price') {
      query = query.order('asking_price', { ascending: true });
    }

    const { data } = await query;
    setDeals((data as Deal[]) || []);
    setLoading(false);
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Count watchlisted deals
    const { count: watchlistCount } = await supabase
      .from('deal_watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Count signed NDAs
    const { count: ndaCount } = await supabase
      .from('company_nda_acceptances')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Count expressed interests
    const { count: interestCount } = await supabase
      .from('deal_interests')
      .select('*', { count: 'exact', head: true })
      .eq('investor_id', user.id);

    setStats({
      dealsViewed: 0,
      watchlisted: watchlistCount || 0,
      ndasSigned: ndaCount || 0,
      interestsExpressed: interestCount || 0
    });
  };

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || deal.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  // Get unique industries
  const industries = [...new Set(deals.map(d => d.industry).filter(Boolean))];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Available Opportunities</h1>
        <p className="text-muted-foreground">Browse curated M&A deals</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deals Viewed</p>
                <p className="text-2xl font-bold">{stats.dealsViewed}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Watchlist</p>
                <p className="text-2xl font-bold">{stats.watchlisted}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NDAs Signed</p>
                <p className="text-2xl font-bold">{stats.ndasSigned}</p>
              </div>
              <FileCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interests</p>
                <p className="text-2xl font-bold">{stats.interestsExpressed}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map(industry => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="revenue">Highest Revenue</SelectItem>
            <SelectItem value="price">Lowest Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deal Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {filteredDeals.length} {filteredDeals.length === 1 ? 'Deal' : 'Deals'} Available
          </h2>
          {searchTerm || industryFilter !== 'all' ? (
            <Badge variant="outline">
              Filtered results
            </Badge>
          ) : null}
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading deals...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No deals match your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map(deal => (
              <InvestorDealCard 
                key={deal.id} 
                deal={{
                  id: deal.id,
                  companyName: deal.company_name,
                  industry: deal.industry,
                  description: deal.description,
                  revenue: deal.revenue,
                  ebitda: deal.ebitda,
                  asking_price: deal.asking_price
                }}
                onClick={() => navigate(`/investor-portal/deal/${deal.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
