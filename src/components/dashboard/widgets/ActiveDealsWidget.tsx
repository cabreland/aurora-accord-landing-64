import React, { useState } from 'react';
import { BarChart3, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Deal {
  id: string;
  name: string;
  stage: string;
  side: 'Buy' | 'Sell';
  partner: string;
  nextAction: string;
}

const mockDeals: Deal[] = [
  { id: 'deal-1', name: 'TechStartup Inc', stage: 'Due Diligence', side: 'Sell', partner: 'Acme Capital', nextAction: 'Review fins' },
  { id: 'deal-2', name: 'Green Energy Co', stage: 'Under LOI', side: 'Sell', partner: 'GreenVentures', nextAction: 'Send CIM' },
  { id: 'deal-3', name: 'HealthTech Solutions', stage: 'Listing', side: 'Sell', partner: 'MedInvest LLC', nextAction: 'Approve docs' },
  { id: 'deal-4', name: 'DataFlow Systems', stage: 'Due Diligence', side: 'Buy', partner: 'Data Partners', nextAction: 'Schedule call' },
  { id: 'deal-5', name: 'CloudServe Pro', stage: 'Closed', side: 'Sell', partner: 'CloudCap', nextAction: 'Final sign-off' },
];

const stageColors: Record<string, string> = {
  'Listing': 'bg-blue-100 text-blue-700 border-blue-200',
  'Due Diligence': 'bg-amber-100 text-amber-700 border-amber-200',
  'Under LOI': 'bg-purple-100 text-purple-700 border-purple-200',
  'Closed': 'bg-green-100 text-green-700 border-green-200',
};

type SortKey = 'name' | 'stage' | 'side' | 'partner';

export const ActiveDealsWidget = () => {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedDeals = [...mockDeals].sort((a, b) => {
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
            <p className="text-xs text-muted-foreground">{mockDeals.length} deals in progress</p>
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
                  Partner <SortIcon column="partner" />
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
                  <Badge variant="outline" className={cn("text-xs", stageColors[deal.stage] || 'bg-gray-100 text-gray-700')}>
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
    </div>
  );
};
