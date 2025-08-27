import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Clock, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import { useInvestorListings, StatusFilter, ListingItem } from '@/hooks/useInvestorListings';
import { useUserProfile } from '@/hooks/useUserProfile';

interface StatusFilterPillsProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  counts: { all: number; draft: number; scheduled: number; live: number };
}

const StatusFilterPills = ({ statusFilter, onStatusFilterChange, counts }: StatusFilterPillsProps) => {
  const filters = [
    { value: 'all' as const, label: 'All', count: counts.all },
    { value: 'draft' as const, label: 'Draft', count: counts.draft },
    { value: 'scheduled' as const, label: 'Scheduled', count: counts.scheduled },
    { value: 'live' as const, label: 'Live', count: counts.live }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={statusFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusFilterChange(filter.value)}
          className={`${
            statusFilter === filter.value
              ? 'bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#F4E4BC]'
              : 'border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10'
          }`}
        >
          {filter.label}
          {filter.count > 0 && (
            <Badge variant="secondary" className="ml-2 bg-[#F4E4BC]/20 text-[#F4E4BC] text-xs">
              {filter.count}
            </Badge>
          )}
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
  const getStatusBadge = (item: ListingItem) => {
    if (item.is_draft) {
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 text-xs">Draft</Badge>;
    }
    
    if (!item.is_published) {
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 text-xs">Draft</Badge>;
    }
    
    if (item.publish_at && new Date(item.publish_at) > new Date()) {
      return <Badge variant="default" className="bg-amber-500/20 text-amber-400 text-xs">Scheduled</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500/20 text-green-400 text-xs">Live</Badge>;
  };

  return (
    <Card 
      className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 hover:border-[#D4AF37]/50 hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-[#FAFAFA] text-lg mb-1 truncate group-hover:text-[#D4AF37] transition-colors">
              {item.name}
            </CardTitle>
            {item.industry && (
              <p className="text-[#F4E4BC]/70 text-sm truncate">{item.industry}</p>
            )}
          </div>
          {showStatus && getStatusBadge(item)}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {item.summary && (
          <p className="text-[#F4E4BC]/80 text-sm mb-4 line-clamp-2">
            {item.summary}
          </p>
        )}
        
        {/* Metrics */}
        {(item.revenue || item.ebitda) && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {item.revenue && (
              <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                <div className="text-[#F4E4BC]/60 text-xs mb-1">Revenue</div>
                <div className="text-[#FAFAFA] font-bold text-sm">{item.revenue}</div>
              </div>
            )}
            {item.ebitda && (
              <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                <div className="text-[#F4E4BC]/60 text-xs mb-1">EBITDA</div>
                <div className="text-[#FAFAFA] font-bold text-sm">{item.ebitda}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[#F4E4BC]/60 text-xs">
          {item.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {item.stage && (
            <Badge variant="outline" className="text-xs capitalize border-[#D4AF37]/30">
              {item.stage}
            </Badge>
          )}
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFAFA]">Investment Opportunities</h1>
          <p className="text-[#F4E4BC] mt-2">
            {canFilter ? 'Manage and review investment opportunities' : 'Explore available investment opportunities'}
          </p>
        </div>
        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Filters (Admin/Staff only) */}
      {canFilter && (
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-[#D4AF37]" />
          <StatusFilterPills 
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            counts={countsByStatus}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-[#2A2F3A] border-[#D4AF37]/30 animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-[#1A1F2E] rounded mb-4"></div>
                <div className="h-4 bg-[#1A1F2E] rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-[#1A1F2E] rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Listings Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="text-center py-12">
              <div className="text-[#F4E4BC] text-xl mb-4">
                {canFilter 
                  ? "No companies match your current filter" 
                  : "No investment opportunities available yet"
                }
              </div>
              {canFilter && statusFilter !== 'all' && (
                <Button 
                  onClick={() => setStatusFilter('all')}
                  className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
                >
                  Show All Companies
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListingsSection;