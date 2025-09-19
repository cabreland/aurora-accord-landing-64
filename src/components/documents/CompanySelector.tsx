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
    <div className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Company:</span>
      </div>
      
      <div className="flex-1 max-w-sm">
        <Select value={selectedDealId} onValueChange={onDealSelect}>
          <SelectTrigger className="h-8 bg-background border-border text-sm">
            <SelectValue placeholder="Select company..." />
          </SelectTrigger>
          <SelectContent className="bg-background border-border shadow-lg z-50">
            <SelectItem value="all" className="hover:bg-muted text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span>All Documents</span>
              </div>
            </SelectItem>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id} className="hover:bg-muted text-sm">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-foreground">{deal.company_name}</span>
                  <Badge variant="outline" className={`${getStatusColor(deal.status)} text-xs px-1 py-0`}>
                    {deal.status === 'draft' ? 'Draft' : 'Active'}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDeal && selectedDealId !== 'all' && (
        <Badge variant="outline" className={`${getStatusColor(selectedDeal.status)} text-xs px-1 py-0`}>
          {selectedDeal.status === 'draft' ? 'Draft' : 'Active'}
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={fetchDeals}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default CompanySelector;