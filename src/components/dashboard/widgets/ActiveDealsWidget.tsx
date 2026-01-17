import React, { useState } from 'react';
import { BarChart3, ChevronUp, ChevronDown, ArrowRight, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Deal {
  id: string;
  name: string;
  stage: string;
  side: 'Buy' | 'Sell';
  partner: string;
  nextAction: string;
}

const stageColors: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-700 border-gray-200',
  'active': 'bg-blue-100 text-blue-700 border-blue-200',
  'deal_initiated': 'bg-blue-100 text-blue-700 border-blue-200',
  'information_request': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'analysis': 'bg-amber-100 text-amber-700 border-amber-200',
  'final_review': 'bg-purple-100 text-purple-700 border-purple-200',
  'closing': 'bg-green-100 text-green-700 border-green-200',
  'Listing': 'bg-blue-100 text-blue-700 border-blue-200',
  'Due Diligence': 'bg-amber-100 text-amber-700 border-amber-200',
  'Under LOI': 'bg-purple-100 text-purple-700 border-purple-200',
  'Closed': 'bg-green-100 text-green-700 border-green-200',
};

const formatStageName = (stage: string | null): string => {
  if (!stage) return 'Active';
  return stage
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

type SortKey = 'name' | 'stage' | 'side' | 'partner';

export const ActiveDealsWidget = () => {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['dashboard-active-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, company_name, current_stage, status, industry, priority')
        .eq('is_test_data', false)
        .or('status.eq.active,current_stage.not.in.(archived,closed)')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((d): Deal => ({
        id: d.id,
        name: d.company_name,
        stage: formatStageName(d.current_stage || d.status),
        side: 'Sell', // Default to Sell side for now
        partner: d.industry || 'N/A',
        nextAction: d.priority === 'high' ? 'Urgent action needed' : 'Review pending',
      }));
    },
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedDeals = [...deals].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const comparison = aVal.localeCompare(bVal);
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDir === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20 mt-1" />
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Active Deals</h3>
            <p className="text-xs text-muted-foreground">{deals.length} deals in progress</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/deals')}
          className="text-muted-foreground hover:text-foreground"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Table */}
      {deals.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active deals</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    Deal Name <SortIcon column="name" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('stage')}
                  className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    Stage <SortIcon column="stage" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('side')}
                  className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    Side <SortIcon column="side" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('partner')}
                  className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    Industry <SortIcon column="partner" />
                  </div>
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Next Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedDeals.map((deal) => (
                <tr
                  key={deal.id}
                  onClick={() => navigate(`/deals/${deal.id}`)}
                  className="hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-sm text-foreground group-hover:text-[#D4AF37] transition-colors">
                      {deal.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className={cn("text-xs", stageColors[deal.stage.toLowerCase().replace(/ /g, '_')] || stageColors[deal.stage] || 'bg-gray-100 text-gray-700')}>
                      {deal.stage}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded",
                      deal.side === 'Buy' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                    )}>
                      {deal.side}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-muted-foreground">{deal.partner}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-muted-foreground">{deal.nextAction}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
