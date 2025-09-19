import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, RefreshCw, FileText } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  company_name: string;
  status: string;
  document_count?: number;
}

interface CompanySelectorProps {
  selectedDealId: string;
  onDealSelect: (dealId: string) => void;
}

const CompanySelector = ({ selectedDealId, onDealSelect }: CompanySelectorProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      
      // Fetch deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id, title, company_name, status')
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Get document counts for each deal
      const dealsWithCounts = await Promise.all(
        (dealsData || []).map(async (deal) => {
          const { count, error: countError } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('deal_id', deal.id);

          if (countError) {
            console.error('Error counting docs for deal:', deal.id, countError);
          }

          return {
            ...deal,
            document_count: count || 0
          };
        })
      );

      setDeals(dealsWithCounts);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'archived': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'pending': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || colors.draft;
  };

  const selectedDeal = deals.find(deal => deal.id === selectedDealId);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Select Company</h3>
            </div>
            
            <div className="flex-1 max-w-md">
              <Select value={selectedDealId} onValueChange={onDealSelect}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Choose a company to manage documents..." />
                </SelectTrigger>
                <SelectContent className="bg-background border-border shadow-lg z-50">
                  <SelectItem value="all" className="hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>All Documents</span>
                    </div>
                  </SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id} className="hover:bg-muted">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium text-foreground">{deal.company_name}</div>
                          <div className="text-xs text-muted-foreground">{deal.title}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className={getStatusColor(deal.status)}>
                            {deal.status.toUpperCase()}
                          </Badge>
                          <span className="text-muted-foreground">
                            {deal.document_count || 0} docs
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDeals}
            disabled={isLoading}
            className="border-border hover:bg-muted"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {selectedDeal && selectedDealId !== 'all' && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{selectedDeal.company_name}</h4>
                <p className="text-sm text-muted-foreground">{selectedDeal.title}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className={getStatusColor(selectedDeal.status)}>
                  {selectedDeal.status.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{selectedDeal.document_count || 0} documents</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanySelector;