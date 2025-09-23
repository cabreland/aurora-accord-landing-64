import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { WidgetContainer } from '@/components/dashboard/shared/WidgetContainer';
import { useMyDeals } from '@/hooks/useMyDeals';
import { UnifiedDealCard } from '@/components/common/UnifiedDealCard';
import { Building2, MapPin, Grid3X3, List, Search, Plus, BarChart3 } from 'lucide-react';

export const MyDealsWidget = () => {
  const { 
    deals, 
    loading, 
    view, 
    setView, 
    filters, 
    updateFilters, 
    clearFilters,
    totalDeals,
    filteredCount 
  } = useMyDeals();

  const viewToggle = (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={view === 'grid' ? 'default' : 'outline'}
        onClick={() => setView('grid')}
        className="p-2 bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
      >
        <Grid3X3 className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant={view === 'list' ? 'default' : 'outline'}
        onClick={() => setView('list')}
        className="p-2 bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );

  if (loading) {
    return (
      <WidgetContainer title="My Deals" icon={BarChart3}>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer 
      title="My Deals" 
      icon={BarChart3} 
      headerActions={viewToggle}
      className="col-span-full lg:col-span-2"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#F4E4BC]/60" />
            <Input
              placeholder="Search deals..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 bg-[#2A2F3A] border-[#D4AF37]/30 text-[#FAFAFA] placeholder:text-[#F4E4BC]/60"
            />
          </div>
          <Select value={filters.status || 'all'} onValueChange={(value) => updateFilters({ status: value })}>
            <SelectTrigger className="w-[150px] bg-[#2A2F3A] border-[#D4AF37]/30 text-[#FAFAFA]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.priority || 'all'} onValueChange={(value) => updateFilters({ priority: value })}>
            <SelectTrigger className="w-[150px] bg-[#2A2F3A] border-[#D4AF37]/30 text-[#FAFAFA]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={clearFilters}
            className="bg-[#2A2F3A] border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/20"
          >
            Clear
          </Button>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-[#F4E4BC]">
          <span>Showing {filteredCount} of {totalDeals} deals</span>
          <Link to="/deals">
            <Button size="sm" className="bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#F4E4BC]">
              <Plus className="w-4 h-4 mr-1" />
              New Deal
            </Button>
          </Link>
        </div>

        {/* Deals Display */}
        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealListItem key={deal.id} deal={deal} />
            ))}
          </div>
        )}

        {deals.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-3" />
            <p className="text-[#F4E4BC]/60">
              {filters.search || filters.status !== 'all' ? 'No deals match your filters' : 'No deals yet'}
            </p>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};

const DealCard = ({ deal }: { deal: any }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/deal/${deal.id}`);
  };

  const unifiedDeal = {
    id: deal.id,
    title: deal.title,
    company_name: deal.company_name,
    industry: deal.industry,
    revenue: deal.revenue,
    ebitda: deal.ebitda,
    location: deal.location,
    status: deal.status,
    priority: deal.priority,
    updated_at: deal.updated_at
  };

  return (
    <UnifiedDealCard
      deal={unifiedDeal}
      variant="dashboard"
      onClick={handleClick}
      showActions={false}
    />
  );
};

const DealListItem = ({ deal }: { deal: any }) => (
  <div className="flex items-center justify-between p-3 bg-[#1A1F2E] border border-[#D4AF37]/20 rounded-lg hover:border-[#D4AF37]/40 transition-colors">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3">
        <h4 className="font-medium text-[#FAFAFA] truncate">{deal.title}</h4>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            deal.status === 'active' ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/50' :
            deal.status === 'draft' ? 'bg-[#F28C38]/20 text-[#F28C38] border-[#F28C38]/50' :
            'bg-[#6B7280]/20 text-[#6B7280] border-[#6B7280]/50'
          }`}
        >
          {deal.status}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-[#F4E4BC]/60 mt-1">
        <span>{deal.company_name}</span>
        <span>{deal.industry || 'N/A'}</span>
        <span>{deal.revenue || 'Revenue TBD'}</span>
      </div>
    </div>
    <Link 
      to={`/deal/${deal.id}`}
      className="text-sm text-[#D4AF37] hover:text-[#F4E4BC] transition-colors"
    >
      View →
    </Link>
  </div>
);