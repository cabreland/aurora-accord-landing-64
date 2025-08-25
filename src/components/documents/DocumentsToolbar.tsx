
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw,
  Building2
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  company_name: string;
}

interface DocumentsToolbarProps {
  onDealSelect: (dealId: string) => void;
  selectedDealId: string;
}

const DocumentsToolbar = ({ onDealSelect, selectedDealId }: DocumentsToolbarProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, company_name')
        .order('title');

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDeals();
    window.location.reload();
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedDealId} onValueChange={onDealSelect}>
              <SelectTrigger className="w-full sm:w-64 bg-background border-border">
                <SelectValue placeholder="Filter by deal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Deals</SelectItem>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{deal.title}</span>
                      <span className="text-xs text-muted-foreground">{deal.company_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedDealId && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Filter className="w-3 h-3 mr-1" />
                Filtered
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-border hover:bg-muted"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsToolbar;
