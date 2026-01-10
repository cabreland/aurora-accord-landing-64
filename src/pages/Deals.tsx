import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/investor/DashboardLayout';

interface Deal {
  id: string;
  title: string;
  company_name: string;
  status: string;
  priority: string;
  revenue: string | null;
  ebitda: string | null;
  industry: string | null;
  created_at: string;
}

const Deals = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, company_name, status, priority, revenue, ebitda, industry, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Deal[];
    }
  });

  const filteredDeals = React.useMemo(() => {
    if (!deals) return [];
    if (!searchQuery) return deals;
    
    const query = searchQuery.toLowerCase();
    return deals.filter(deal => 
      deal.title.toLowerCase().includes(query) ||
      deal.company_name.toLowerCase().includes(query) ||
      deal.industry?.toLowerCase().includes(query)
    );
  }, [deals, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'closed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout activeTab="deals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deals</h1>
            <p className="text-muted-foreground">Manage your active deals and track progress</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Deal
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deals found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first deal'}
              </p>
              {!searchQuery && (
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Deal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((deal) => (
              <Card 
                key={deal.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/deals/${deal.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {deal.company_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{deal.title}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className={getStatusColor(deal.status)}>
                      {deal.status}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(deal.priority)}>
                      {deal.priority}
                    </Badge>
                    {deal.industry && (
                      <Badge variant="outline" className="bg-muted/50">
                        {deal.industry}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span className="text-xs">Revenue</span>
                      </div>
                      <p className="font-medium text-sm">{deal.revenue || 'N/A'}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-xs">EBITDA</span>
                      </div>
                      <p className="font-medium text-sm">{deal.ebitda || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Deals;
