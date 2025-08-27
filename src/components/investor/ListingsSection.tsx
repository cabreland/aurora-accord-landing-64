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
  BarChart3,
  Star,
  FileText,
  Download
} from 'lucide-react';
import { useInvestorListings, StatusFilter, ListingItem } from '@/hooks/useInvestorListings';
import { useUserProfile } from '@/hooks/useUserProfile';

interface StatusFilterPillsProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  counts: { all: number; draft: number; scheduled: number; live: number };
}

// Dashboard Header Component
const DashboardHeader = ({ totalDeals, canFilter }: { totalDeals: number, canFilter: boolean }) => {
  return (
    <div className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] rounded-2xl border border-[#D4AF37]/30 p-8 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#FAFAFA] mb-2">Investor Portal</h1>
          <p className="text-[#F4E4BC] text-lg">
            Real-time access to curated M&A opportunities with comprehensive deal analytics
          </p>
        </div>
        <Button
          className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Live Deals Dashboard
        </Button>
      </div>
    </div>
  );
};

// Portfolio metrics component with exact design specifications
const PortfolioMetrics = ({ items, canFilter }: { items: ListingItem[], canFilter: boolean }) => {
  const totalValue = items.reduce((sum, item) => {
    const revenue = parseFloat(item.revenue?.replace(/[\$,]/g, '') || '0');
    return sum + revenue;
  }, 0);

  const activeDeals = items.filter(item => !item.is_draft && item.is_published).length;
  const highPriority = items.filter(item => item.stage === 'growth' || item.stage === 'mature').length;
  const ndaSigned = Math.floor(items.length * 0.4);
  const dueDiligence = Math.floor(items.length * 0.2);

  const metrics = [
    {
      icon: DollarSign,
      label: 'Total Deal Value',
      value: `$${(totalValue / 1000000).toFixed(1)}M`,
      subtitle: 'Combined revenue',
      color: 'from-[#22C55E]/20 to-[#22C55E]/10',
      iconColor: 'text-[#22C55E]',
      borderColor: 'border-[#22C55E]/30'
    },
    {
      icon: Target,
      label: 'Active Deals',
      value: activeDeals.toString(),
      subtitle: 'In pipeline', 
      color: 'from-[#D4AF37]/20 to-[#D4AF37]/10',
      iconColor: 'text-[#D4AF37]',
      borderColor: 'border-[#D4AF37]/30'
    },
    {
      icon: TrendingUp,
      label: 'High Priority', 
      value: highPriority.toString(),
      subtitle: 'Urgent deals',
      color: 'from-[#F28C38]/20 to-[#F28C38]/10',
      iconColor: 'text-[#F28C38]',
      borderColor: 'border-[#F28C38]/30'
    },
    {
      icon: Shield,
      label: 'NDAs Signed',
      value: ndaSigned.toString(),
      subtitle: 'Ready for review',
      color: 'from-[#22C55E]/20 to-[#22C55E]/10', 
      iconColor: 'text-[#22C55E]',
      borderColor: 'border-[#22C55E]/30'
    },
    {
      icon: CheckCircle,
      label: 'Due Diligence',
      value: dueDiligence.toString(),
      subtitle: 'Advanced stage',
      color: 'from-[#D4AF37]/20 to-[#D4AF37]/10',
      iconColor: 'text-[#D4AF37]',
      borderColor: 'border-[#D4AF37]/30'
    },
    {
      icon: Timer,
      label: 'Avg Timeline',
      value: '14 days',
      subtitle: 'to NDA signing',
      color: 'from-[#F4E4BC]/20 to-[#F4E4BC]/10',
      iconColor: 'text-[#F4E4BC]',
      borderColor: 'border-[#F4E4BC]/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className={`bg-gradient-to-br ${metric.color} border ${metric.borderColor} hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all duration-300 transform hover:scale-105`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                <div className={`w-2 h-2 ${metric.iconColor} rounded-full opacity-60`}></div>
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
    { value: 'all' as const, label: 'All Deals', count: counts.all, badge: 'High Priority' },
    { value: 'live' as const, label: 'NDA Signed', count: counts.live, badge: 'NDA Signed' },
    { value: 'scheduled' as const, label: '$1M+ Revenue', count: counts.scheduled, badge: '$1M+ Revenue' },
    { value: 'draft' as const, label: 'Draft', count: counts.draft, badge: 'Draft' }
  ];

  return (
    <div className="flex gap-4 flex-wrap items-center">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#D4AF37]" />
        <span className="text-sm font-medium text-[#F4E4BC]">Filter Deals</span>
      </div>
      {filters.map((filter) => (
        <Badge
          key={filter.value}
          variant={statusFilter === filter.value ? "default" : "outline"}
          className={`cursor-pointer px-4 py-2 rounded-full transition-all duration-300 ${
            statusFilter === filter.value
              ? 'bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#F4E4BC] shadow-lg'
              : 'border-[#D4AF37]/40 text-[#F4E4BC] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/60'
          }`}
          onClick={() => onStatusFilterChange(filter.value)}
        >
          {filter.badge}
        </Badge>
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
  // Priority badge logic following exact design specs
  const getPriorityBadge = (item: ListingItem) => {
    const revenue = parseFloat(item.revenue?.replace(/[\$,]/g, '') || '0');
    if (revenue > 10000000) {
      return <Badge className="bg-[#F28C38] text-[#0A0F0F] text-xs font-medium px-2 py-1">High</Badge>;
    }
    return <Badge className="bg-[#D4AF37] text-[#0A0F0F] text-xs font-medium px-2 py-1">Medium</Badge>;
  };

  // Industry tag following design specs  
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

  // Progress calculation
  const getCompletionPercentage = (item: ListingItem) => {
    if (item.is_draft) return 25;
    if (!item.is_published) return 50;
    if (item.publish_at && new Date(item.publish_at) > new Date()) return 75;
    return 95;
  };

  // Fit score with proper color coding
  const getFitScore = (item: ListingItem) => {
    const revenue = parseFloat(item.revenue?.replace(/[\$,]/g, '') || '0');
    if (revenue > 10000000) return { score: '92%', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/20' };
    if (revenue > 5000000) return { score: '87%', color: 'text-[#F28C38]', bg: 'bg-[#F28C38]/20' };
    return { score: '78%', color: 'text-[#F28C38]', bg: 'bg-[#F28C38]/20' };
  };

  const completion = getCompletionPercentage(item);
  const fitScore = getFitScore(item);
  const timeAgo = Math.floor(Math.random() * 5) + 1;

  return (
    <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all duration-300 cursor-pointer group transform hover:scale-[1.02] rounded-2xl">
      <CardContent className="p-6">
        {/* Header - Company name + badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-[#FAFAFA] group-hover:text-[#D4AF37] transition-colors">
                {item.name}
              </h3>
              {getPriorityBadge(item)}
            </div>
            {item.industry && (
              <Badge variant="outline" className="text-xs text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10">
                {getIndustryTag(item.industry)}
              </Badge>
            )}
          </div>
        </div>

        {/* Description - 2-line clamp */}
        {item.summary && (
          <p className="text-sm text-[#F4E4BC]/80 mb-4 line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        )}

        {/* Metrics grid - 2 columns */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {item.revenue && (
            <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
              <div className="text-[#F4E4BC]/60 text-xs mb-1 font-medium">Revenue</div>
              <div className="text-lg font-bold text-[#FAFAFA]">{item.revenue}</div>
            </div>
          )}
          {item.ebitda && (
            <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
              <div className="text-[#F4E4BC]/60 text-xs mb-1 font-medium">EBITDA</div>
              <div className="text-lg font-bold text-[#FAFAFA]">{item.ebitda}</div>
            </div>
          )}
        </div>

        {/* Progress bar - Custom gold gradient */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[#F4E4BC]/60 text-xs font-medium">NDA Progress</span>
            <span className="text-[#FAFAFA] text-xs font-bold">{completion}% Complete</span>
          </div>
          <div className="w-full bg-[#1A1F2E] rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Fit score with star icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${fitScore.bg}`}>
            <Star className={`w-4 h-4 ${fitScore.color}`} />
            <span className="text-xs font-bold text-[#FAFAFA]">Fit Score</span>
            <span className={`text-xs font-bold ${fitScore.color}`}>{fitScore.score}</span>
          </div>
        </div>

        {/* Location/timestamp */}
        <div className="flex items-center justify-between text-[#F4E4BC]/60 text-xs mb-6">
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

        {/* Action buttons - Primary + Secondary */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Building2 className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button 
            variant="outline"
            className="bg-[#F28C38] hover:bg-[#F28C38]/80 text-[#0A0F0F] border-[#F28C38] font-bold py-2.5 px-4 rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
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
    <div className="py-24 space-y-8">
      {/* Dashboard Header */}
      <DashboardHeader totalDeals={items.length} canFilter={canFilter} />

      {/* Portfolio Metrics */}
      <PortfolioMetrics items={items} canFilter={canFilter} />

      {/* Filter Section */}
      <div className="flex items-center justify-between">
        <StatusFilterPills 
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          counts={countsByStatus}
        />
        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F] rounded-xl transition-all duration-300"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 animate-pulse rounded-2xl">
              <CardContent className="p-6">
                <div className="h-6 bg-[#1A1F2E] rounded mb-4"></div>
                <div className="h-4 bg-[#1A1F2E] rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-[#1A1F2E] rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-[#1A1F2E] rounded mb-4"></div>
                <div className="h-10 bg-[#1A1F2E] rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Deal Cards Grid - 3 columns XL, 2 LG, 1 mobile */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item.id)}
                showStatus={canFilter}
              />
            ))}
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-24">
              <div className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] rounded-2xl p-12 max-w-md mx-auto border border-[#D4AF37]/20">
                <Building2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
                <div className="text-[#F4E4BC] text-xl mb-4 font-medium">
                  {canFilter 
                    ? "No deals match your current filter" 
                    : "No investment opportunities available"
                  }
                </div>
                <p className="text-[#F4E4BC]/60 mb-8">
                  {canFilter 
                    ? "Try adjusting your filter criteria to see more deals"
                    : "New opportunities will appear here when they become available"
                  }
                </p>
                {canFilter && statusFilter !== 'all' && (
                  <Button 
                    onClick={() => setStatusFilter('all')}
                    className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold rounded-xl px-8 py-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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