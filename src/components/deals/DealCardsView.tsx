import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Building2, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { MyDeal } from '@/hooks/useMyDeals';
import { Skeleton } from '@/components/ui/skeleton';
import { UnifiedDealCard, UnifiedDealData } from '@/components/common/UnifiedDealCard';

interface DealCardsViewProps {
  deals: MyDeal[];
  loading: boolean;
  onDealSelect: (dealId: string | null) => void;
  selectedDealId: string | null;
}

export const DealCardsView: React.FC<DealCardsViewProps> = ({
  deals,
  loading,
  onDealSelect,
  selectedDealId
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No deals found</h3>
        <p className="text-muted-foreground max-w-md">
          No deals match your current filters. Try adjusting your search criteria or create a new deal.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {deals.map((deal) => {
          const unifiedDeal: UnifiedDealData = {
            id: deal.id,
            title: deal.title,
            company_name: deal.company_name,
            industry: deal.industry,
            revenue: deal.revenue,
            ebitda: deal.ebitda,
            asking_price: deal.asking_price,
            location: deal.location,
            status: deal.status,
            priority: deal.priority as any,
            created_at: deal.created_at,
            updated_at: deal.updated_at,
            description: deal.description,
            // Digital business metrics
            growth_rate: deal.growth_rate
          };

          return (
            <UnifiedDealCard
              key={deal.id}
              deal={unifiedDeal}
              variant="management"
              isSelected={selectedDealId === deal.id}
              onClick={() => onDealSelect(deal.id)}
              showActions={true}
            />
          );
        })}
      </div>
    </div>
  );
};