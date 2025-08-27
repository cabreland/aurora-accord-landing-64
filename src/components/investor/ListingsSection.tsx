import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Filter, 
  RefreshCw,
  DollarSign,
  Target,
  Shield,
  CheckCircle,
  Timer,
  BarChart3
} from 'lucide-react';
import { useInvestorListings, StatusFilter, ListingItem } from '@/hooks/useInvestorListings';
import { useUserProfile } from '@/hooks/useUserProfile';

interface StatusFilterPillsProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  counts: { all: number; draft: number; scheduled: number; live: number };
}

// Portfolio metrics component
const PortfolioMetrics = ({ items, canFilter }: { items: ListingItem[], canFilter: boolean }) => {
  const totalValue = items.reduce((sum, item) => {
    const revenue = parseFloat(item.revenue?.replace(/[\$,]/g, '') || '0');
    return sum + revenue;
  }, 0);

  const activeDeals = items.filter(item => !item.is_draft && item.is_published).length;
  const highPriority = items.filter(item => item.stage === 'growth' || item.stage === 'mature').length;
  const ndaSigned = Math.floor(items.length * 0.4); // Mock calculation
  const dueDiligence = Math.floor(items.length * 0.2); // Mock calculation

  const metrics = [
    {
      icon: DollarSign,
      label: 'Total Deal Value',
      value: `$${(totalValue / 1000000).toFixed(1)}M`,
      subtitle: 'Combined revenue',
      color: 'from-emerald-500/20 to-emerald-600/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    },
    {
      icon: Target,
      label: 'Active Deals',
      value: activeDeals.toString(),
      subtitle: 'In pipeline',
      color: 'from-amber-500/20 to-yellow-600/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30'
    },
    {
      icon: TrendingUp,
      label: 'High Priority',
      value: highPriority.toString(),
      subtitle: 'Urgent deals',
      color: 'from-orange-500/20 to-red-600/20',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/30'
    },
    {
      icon: Shield,
      label: 'NDAs Signed',
      value: ndaSigned.toString(),
      subtitle: 'Ready for review',
      color: 'from-cyan-500/20 to-blue-600/20',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30'
    },
    {
      icon: CheckCircle,
      label: 'Due Diligence',
      value: dueDiligence.toString(),
      subtitle: 'Advanced stage',
      color: 'from-purple-500/20 to-indigo-600/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30'
    },
    {
      icon: Timer,
      label: 'Avg Timeline',
      value: '14 days',
      subtitle: 'to NDA signing',
      color: 'from-gray-500/20 to-slate-600/20',
      iconColor: 'text-gray-400',
      borderColor: 'border-gray-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className={`bg-gradient-to-br ${metric.color} border ${metric.borderColor} hover:shadow-lg transition-all duration-300`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">{metric.value}</div>
                <div className="text-xs text-[#F4E4BC]/60 font-medium">{metric.label}</div>
                <div className="text-xs text-[#F4E4BC]/40">{metric.subtitle}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const StatusFilterPills = ({ statusFilter, onStatusFilterChange, counts }: StatusFilterPillsProps) => {
  const filters = [
    { value: 'all' as const, label: 'All Deals', count: counts.all },
    { value: 'live' as const, label: 'High Priority', count: counts.live },
    { value: 'scheduled' as const, label: 'NDA Signed', count: counts.scheduled },
    { value: 'draft' as const, label: '$1M+ Revenue', count: counts.draft }
  ];

  return (
    <div className="flex gap-3 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={statusFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusFilterChange(filter.value)}
          className={`rounded-full px-4 py-2 transition-all duration-300 ${
            statusFilter === filter.value
              ? 'bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#F4E4BC] shadow-lg'
              : 'border-[#D4AF37]/40 text-[#F4E4BC] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/60'
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

interface ListingCardProps {
  item: ListingItem;
  onClick: () => void;
  showStatus?: boolean;
}

const ListingCard = ({ item, onClick, showStatus = false }: ListingCardProps) => {
  // Mock data for enhanced display
  const getPriorityBadge = (item: ListingItem) => {
    const revenue = parseFloat(item.revenue?.replace(/[\$,]/g, '') || '0');
    if (revenue > 10000000) {
      return <Badge className="bg-[#F28C38] text-[#0A0F0F] text-xs font-medium">High</Badge>;
    }
    return <Badge className="bg-[#D4AF37]/30 text-[#F4E4BC] text-xs font-medium">Medium</Badge>;
  };

  const getIndustryTag = (industry: string) => {
    const tags: { [key: string]: string } = {
      'Technology': 'SaaS',
      'Healthcare': 'HealthTech',
      'Manufacturing': 'Industrial',
      'Retail': 'Retail',
      'Financial Services': 'FinTech'
    };
    return tags[industry] || industry?.split(' ')[0] || 'Tech';
  };

  const getCompletionPercentage = (item: ListingItem) => {
    if (item.is_draft) return 25;
    if (!item.is_published) return 50;
    if (item.publish_at && new Date(item.publish_at) > new Date()) return 75;
    return 95;
  };

  const getFitScore = (item: ListingItem) => {
    const revenue = parseFloat(item.revenue?.replace(/[\$,]/g, '') || '0');
    if (revenue > 10000000) return { score: '92%', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (revenue > 5000000) return { score: '87%', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    return { score: '78%', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  };

  const completion = getCompletionPercentage(item);
  const fitScore = getFitScore(item);
  const timeAgo = Math.floor(Math.random() * 5) + 1;

  return (
    <Card className="bg-gradient-to-br from-[#2A2F3A] via-[#252A36] to-[#1E242E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-500 cursor-pointer group overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[#FAFAFA] text-lg font-bold group-hover:text-[#D4AF37] transition-colors">
                {item.name}
              </h3>
              {getPriorityBadge(item)}
            </div>
            {item.industry && (
              <Badge variant="outline" className="text-xs text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/5">
                {getIndustryTag(item.industry)}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {item.summary && (
          <p className="text-[#F4E4BC]/70 text-sm mb-4 line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        )}

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {item.revenue && (
            <div className="bg-[#0A0F0F]/60 rounded-lg p-3 border border-[#D4AF37]/10">
              <div className="text-[#F4E4BC]/50 text-xs mb-1 font-medium">Revenue</div>
              <div className="text-[#FAFAFA] font-bold text-base">{item.revenue}</div>
            </div>
          )}
          {item.ebitda && (
            <div className="bg-[#0A0F0F]/60 rounded-lg p-3 border border-[#D4AF37]/10">
              <div className="text-[#F4E4BC]/50 text-xs mb-1 font-medium">EBITDA</div>
              <div className="text-[#FAFAFA] font-bold text-base">{item.ebitda}</div>
            </div>
          )}
        </div>

        {/* Progress and Status */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[#F4E4BC]/60 text-xs font-medium">NDA Signed</span>
            <span className="text-[#FAFAFA] text-xs font-bold">{completion}% Complete</span>
          </div>
          <Progress 
            value={completion} 
            className="h-2 bg-[#1A1F2E]"
          />
          
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${fitScore.bg}`}>
              <BarChart3 className={`w-3 h-3 ${fitScore.color}`} />
              <span className="text-xs font-bold text-[#FAFAFA]">Fit Score</span>
              <span className={`text-xs font-bold ${fitScore.color}`}>{fitScore.score}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[#F4E4BC]/50 text-xs mb-4">
          {item.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{item.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeAgo} hours ago</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold py-2.5 transition-all duration-300 transform hover:scale-[1.02]"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Building2 className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

const ListingsSection = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const userRole = profile?.role || 'viewer';
  
  const {
    items,
    isLoading,
    error,
    countsByStatus,
    statusFilter,
    setStatusFilter,
    refresh,
    canFilter
  } = useInvestorListings(userRole);

  const handleItemClick = (itemId: string) => {
    navigate(`/deal/${itemId}`);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-xl mb-4">Failed to load listings</div>
        <Button onClick={refresh} className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F]">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#FAFAFA] mb-2">Investor Portal</h1>
          <p className="text-[#F4E4BC]/80 text-lg">
            Real-time access to curated M&A opportunities with comprehensive deal analytics
          </p>
        </div>
        <Button
          onClick={() => navigate('/deals')}
          className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Live Deals Dashboard
        </Button>
      </div>

      {/* Portfolio Metrics */}
      <PortfolioMetrics items={items} canFilter={canFilter} />

      {/* Enhanced Filter Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[#F4E4BC] font-medium">Filter Deals</span>
          </div>
          <StatusFilterPills 
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            counts={countsByStatus}
          />
        </div>
        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-[#D4AF37]/40 text-[#F4E4BC] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/60 rounded-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-[#2A2F3A] border-[#D4AF37]/30 animate-pulse h-96">
              <CardContent className="p-6">
                <div className="h-6 bg-[#1A1F2E] rounded mb-4"></div>
                <div className="h-4 bg-[#1A1F2E] rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-[#1A1F2E] rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-[#1A1F2E] rounded mb-4"></div>
                <div className="h-8 bg-[#1A1F2E] rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Premium Listings Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item.id)}
                showStatus={canFilter}
              />
            ))}
          </div>

          {/* Enhanced Empty State */}
          {items.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-[#2A2F3A]/50 rounded-2xl p-8 max-w-md mx-auto border border-[#D4AF37]/20">
                <Building2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                <div className="text-[#F4E4BC] text-xl mb-2 font-medium">
                  {canFilter 
                    ? "No deals match your current filter" 
                    : "No investment opportunities available"
                  }
                </div>
                <p className="text-[#F4E4BC]/60 mb-6">
                  {canFilter 
                    ? "Try adjusting your filter criteria to see more deals"
                    : "New opportunities will appear here when they become available"
                  }
                </p>
                {canFilter && statusFilter !== 'all' && (
                  <Button 
                    onClick={() => setStatusFilter('all')}
                    className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold rounded-full px-6 py-2"
                  >
                    Show All Deals
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListingsSection;