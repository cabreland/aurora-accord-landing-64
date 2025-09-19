import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus } from 'lucide-react';
import { MyDeal } from '@/hooks/useMyDeals';
import { Button } from '@/components/ui/button';

interface DealKanbanViewProps {
  deals: MyDeal[];
  loading: boolean;
  onDealSelect: (dealId: string | null) => void;
  selectedDealId: string | null;
  onCreateDeal?: (status: 'draft' | 'active' | 'archived') => void;
}

export const DealKanbanView: React.FC<DealKanbanViewProps> = ({
  deals,
  loading,
  onDealSelect,
  selectedDealId,
  onCreateDeal
}) => {
  const columns = [
    {
      id: 'draft',
      title: 'Draft',
      deals: deals.filter(deal => deal.status === 'draft'),
      color: 'bg-gray-50 border-gray-200'
    },
    {
      id: 'active',
      title: 'Active',
      deals: deals.filter(deal => deal.status === 'active'),
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'archived',
      title: 'Archived',
      deals: deals.filter(deal => deal.status === 'archived'),
      color: 'bg-green-50 border-green-200'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">{column.title}</h3>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">{column.title}</h3>
              <Badge variant="secondary">{column.deals.length}</Badge>
            </div>

            {/* Column Content */}
            <div className={`rounded-lg border-2 border-dashed p-4 min-h-96 space-y-3 ${column.color}`}>
              {column.deals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Building2 className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No {column.title.toLowerCase()} deals</p>
                </div>
              ) : (
                column.deals.map((deal) => (
                  <Card 
                    key={deal.id}
                    className={`cursor-pointer transition-all hover:shadow-md bg-background ${
                      selectedDealId === deal.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onDealSelect(deal.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate" title={deal.title}>
                            {deal.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate" title={deal.company_name}>
                            {deal.company_name}
                          </p>
                        </div>
                        {deal.priority && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              deal.priority === 'high' ? 'border-red-200 text-red-600' :
                              deal.priority === 'medium' ? 'border-yellow-200 text-yellow-600' :
                              'border-green-200 text-green-600'
                            }`}
                          >
                            {deal.priority}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {deal.industry && (
                          <p className="text-xs text-muted-foreground">
                            {deal.industry}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center text-xs">
                          {deal.revenue && (
                            <span className="font-medium" title={`Revenue: ${deal.revenue}`}>
                              {deal.revenue}
                            </span>
                          )}
                          {deal.ebitda && (
                            <span className="text-muted-foreground" title={`EBITDA: ${deal.ebitda}`}>
                              {deal.ebitda}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(deal.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Add Deal Button */}
              <Button 
                variant="ghost" 
                className="w-full h-12 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
                onClick={() => onCreateDeal?.(column.id as 'draft' | 'active' | 'archived')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {column.title} Deal
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};