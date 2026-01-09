import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Building2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface Deal {
  id: string;
  title: string;
  company_name: string;
  industry: string | null;
  status: string;
}

interface DealSelectorProps {
  onSelect: (dealId: string) => void;
}

export const DealSelector: React.FC<DealSelectorProps> = ({ onSelect }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const { data, error } = await supabase
      .from('deals')
      .select('id, title, company_name, industry, status')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
    } else {
      setDeals(data || []);
    }
    setLoading(false);
  };

  const filteredDeals = deals.filter(
    (deal) =>
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'closed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Deal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeals.map((deal) => (
          <Card
            key={deal.id}
            className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
            onClick={() => onSelect(deal.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <Badge className={getStatusColor(deal.status)}>{deal.status}</Badge>
              </div>

              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {deal.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Building2 className="h-3.5 w-3.5" />
                {deal.company_name}
              </div>

              {deal.industry && (
                <Badge variant="outline" className="text-xs">
                  {deal.industry}
                </Badge>
              )}

              <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Open Data Room
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'No deals match your search' : 'No deals available'}
        </div>
      )}
    </div>
  );
};
