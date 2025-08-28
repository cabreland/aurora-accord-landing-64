import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Building2, ArrowUpDown } from 'lucide-react';
import { MyDeal } from '@/hooks/useMyDeals';
import { Skeleton } from '@/components/ui/skeleton';

interface DealListViewProps {
  deals: MyDeal[];
  loading: boolean;
  onDealSelect: (dealId: string | null) => void;
  selectedDealId: string | null;
}

export const DealListView: React.FC<DealListViewProps> = ({
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
        <Card>
          <div className="p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </Card>
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
      <Card>
        {/* Table Header */}
        <div className="border-b border-border bg-muted/30">
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-3 flex items-center gap-1">
              Deal Title
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div className="col-span-2">Company</div>
            <div className="col-span-1">Industry</div>
            <div className="col-span-1">Revenue</div>
            <div className="col-span-1">EBITDA</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-1">Updated</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {deals.map((deal, index) => (
            <div 
              key={deal.id}
              className={`grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors ${
                selectedDealId === deal.id ? 'bg-muted/50 border-l-4 border-l-primary' : ''
              }`}
              onClick={() => onDealSelect(deal.id)}
            >
              <div className="col-span-3">
                <div className="font-medium text-foreground truncate" title={deal.title}>
                  {deal.title}
                </div>
              </div>
              
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground truncate" title={deal.company_name}>
                  {deal.company_name}
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="text-sm text-muted-foreground truncate">
                  {deal.industry || '-'}
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="text-sm font-medium truncate" title={deal.revenue}>
                  {deal.revenue || '-'}
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="text-sm font-medium truncate" title={deal.ebitda}>
                  {deal.ebitda || '-'}
                </div>
              </div>
              
              <div className="col-span-1">
                <Badge variant={getStatusVariant(deal.status)} className="text-xs">
                  {deal.status}
                </Badge>
              </div>
              
              <div className="col-span-1">
                {deal.priority ? (
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(deal.priority)}`}>
                    {deal.priority}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
              
              <div className="col-span-1">
                <div className="text-xs text-muted-foreground">
                  {new Date(deal.updated_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="col-span-1 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle menu actions
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};