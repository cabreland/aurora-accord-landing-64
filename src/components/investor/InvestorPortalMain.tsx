import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Clock, 
  MessageSquare,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useInvestorContext } from '@/hooks/useInvestorContext';
import { useInvestorDeals } from '@/hooks/useInvestorDeals';
import DealCard from '@/components/investor/DealCard';
import { getDealDetailRoute } from '@/lib/data/dealRouting';
import InvestorPortalLayout from '@/layouts/InvestorPortalLayout';

const InvestorPortalMain = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { metrics, investorInfo, loading: contextLoading } = useInvestorContext();
  const { 
    filteredDeals, 
    loading: dealsLoading, 
    handleDealClick,
    handleFilterChange 
  } = useInvestorDeals();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const loading = profileLoading || contextLoading || dealsLoading;

  const handleDealCardClick = async (id: string) => {
    handleDealClick(id); // Log activity via hook
    
    // Resolve the correct route (handles both company and deal IDs)
    const route = await getDealDetailRoute(id);
    navigate(route);
  };

  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter) 
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    
    setActiveFilters(newFilters);
    
    // Apply filters to deals
    handleFilterChange({
      watchlistOnly: newFilters.includes('My Watchlist'),
      ndaOnly: newFilters.includes('Under NDA'),
      newThisWeek: newFilters.includes('New This Week'),
      minRevenue: newFilters.includes('$10M+ Revenue') ? 10000000 : undefined
    });
  };

  return (
    <InvestorPortalLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <Card className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] border-[#D4AF37]/30">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#FAFAFA] mb-4">Investor Portal</h1>
                <p className="text-xl text-[#F4E4BC]">
                  Real-time access to curated M&A opportunities with comprehensive deal analytics
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] px-6 py-3 text-base font-bold rounded-full">
                Live Deals Dashboard
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards - Buyer Focused */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer"
                onClick={() => toggleFilter('My Watchlist')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-[#D4AF37]" />
                <div className="w-2 h-2 bg-[#F28C38] rounded-full"></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">
                  {loading ? '...' : (metrics?.watchlistCount || 0)}
                </div>
                <div className="text-sm text-[#F4E4BC]/60">My Watchlist</div>
                <div className="text-xs text-[#F4E4BC]/40">Deals I'm tracking</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer"
                onClick={() => toggleFilter('Under NDA')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">
                  {loading ? '...' : (metrics?.ndaDealsCount || 0)}
                </div>
                <div className="text-sm text-[#F4E4BC]/60">Under NDA</div>
                <div className="text-xs text-[#F4E4BC]/40">Full access granted</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer"
                onClick={() => toggleFilter('New This Week')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-[#D4AF37]" />
                <div className="w-2 h-2 bg-[#F28C38] rounded-full"></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">
                  {loading ? '...' : (metrics?.newThisWeekCount || 0)}
                </div>
                <div className="text-sm text-[#F4E4BC]/60">New This Week</div>
                <div className="text-xs text-[#F4E4BC]/40">Fresh opportunities</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/investor-portal/messages')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <MessageSquare className="w-8 h-8 text-[#D4AF37]" />
                {(metrics?.unreadMessagesCount || 0) > 0 && (
                  <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">
                  {loading ? '...' : (metrics?.unreadMessagesCount || 0)}
                </div>
                <div className="text-sm text-[#F4E4BC]/60">Messages</div>
                <div className="text-xs text-[#F4E4BC]/40">Unread messages</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-bold text-[#FAFAFA]">Filter Deals</h3>
                {activeFilters.length > 0 && (
                  <Badge className="bg-[#D4AF37] text-[#0A0F0F]">{activeFilters.length}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                Advanced <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <Button
                variant={activeFilters.includes('My Watchlist') ? 'default' : 'outline'}
                onClick={() => toggleFilter('My Watchlist')}
                className={`${
                  activeFilters.includes('My Watchlist')
                    ? 'bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#D4AF37]/80'
                    : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10'
                }`}
              >
                My Watchlist
              </Button>
              <Button
                variant={activeFilters.includes('Under NDA') ? 'default' : 'outline'}
                onClick={() => toggleFilter('Under NDA')}
                className={`${
                  activeFilters.includes('Under NDA')
                    ? 'bg-[#22C55E] text-[#0A0F0F] hover:bg-[#22C55E]/80'
                    : 'border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10'
                }`}
              >
                Under NDA
              </Button>
              <Button
                variant={activeFilters.includes('New This Week') ? 'default' : 'outline'}
                onClick={() => toggleFilter('New This Week')}
                className={`${
                  activeFilters.includes('New This Week')
                    ? 'bg-[#F28C38] text-[#0A0F0F] hover:bg-[#F28C38]/80'
                    : 'border-[#F28C38] text-[#F28C38] hover:bg-[#F28C38]/10'
                }`}
              >
                New This Week
              </Button>
              <Button
                variant={activeFilters.includes('$10M+ Revenue') ? 'default' : 'outline'}
                onClick={() => toggleFilter('$10M+ Revenue')}
                className={`${
                  activeFilters.includes('$10M+ Revenue')
                    ? 'bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#D4AF37]/80'
                    : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10'
                }`}
              >
                $10M+ Revenue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-[#D4AF37]/20 rounded mb-4"></div>
                    <div className="h-4 bg-[#F4E4BC]/20 rounded mb-2"></div>
                    <div className="h-4 bg-[#F4E4BC]/20 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDeals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-[#F4E4BC]/60 text-lg mb-4">No deals match your filters.</p>
              <Button 
                onClick={() => setActiveFilters([])}
                className="bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#D4AF37]/80"
              >
                Clear filters to see all available opportunities
              </Button>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <DealCard 
                key={deal.id}
                deal={deal}
                onClick={() => handleDealCardClick(deal.id)}
                isSelected={selectedDealId === deal.id}
              />
            ))
          )}
        </div>
      </div>
    </InvestorPortalLayout>
  );
};

export default InvestorPortalMain;