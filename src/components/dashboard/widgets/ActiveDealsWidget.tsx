import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Clock, 
  FileText,
  MessageSquare,
  ChevronRight,
  Plus
} from 'lucide-react';
import { DealHealth } from '@/hooks/useMissionControl';
import { formatDistanceToNow } from 'date-fns';

interface ActiveDealsWidgetProps {
  deals: DealHealth[];
  loading: boolean;
}

type SortOption = 'health' | 'activity' | 'stage' | 'value';

const getHealthDot = (score: number) => {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

const formatStageName = (stage: string) => {
  const stageLabels: Record<string, string> = {
    'closing': 'Closing',
    'final_review': 'Final Review',
    'analysis': 'Analysis',
    'information_request': 'Info Request',
    'deal_initiated': 'Initiated'
  };
  return stageLabels[stage] || stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export const ActiveDealsWidget: React.FC<ActiveDealsWidgetProps> = ({
  deals,
  loading
}) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('health');

  const activeDeals = deals.filter(d => d.status === 'active');

  const sortedDeals = [...activeDeals].sort((a, b) => {
    switch (sortBy) {
      case 'health':
        return a.health_score - b.health_score;
      case 'activity':
        return new Date(a.last_activity || 0).getTime() - new Date(b.last_activity || 0).getTime();
      case 'stage':
        const stageOrder = ['closing', 'final_review', 'analysis', 'information_request', 'deal_initiated'];
        return stageOrder.indexOf(a.current_stage) - stageOrder.indexOf(b.current_stage);
      case 'value':
        const parseValue = (str: string | null) => {
          if (!str) return 0;
          const num = parseFloat(str.replace(/[^0-9.]/g, '') || '0');
          let mult = 1;
          if (str.toLowerCase().includes('m')) mult = 1000000;
          if (str.toLowerCase().includes('k')) mult = 1000;
          if (str.toLowerCase().includes('b')) mult = 1000000000;
          return num * mult;
        };
        return parseValue(b.asking_price) - parseValue(a.asking_price);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Active Deals</h2>
          <p className="text-sm text-gray-500">{activeDeals.length} deals in progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[150px] h-9 bg-gray-50 border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="health">Health (worst first)</SelectItem>
              <SelectItem value="activity">Last active</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
              <SelectItem value="value">Value</SelectItem>
            </SelectContent>
          </Select>
          <Link to="/deals">
            <Button variant="outline" size="sm" className="border-gray-200">
              View All
            </Button>
          </Link>
        </div>
      </div>

      {sortedDeals.length === 0 ? (
        <div className="py-16 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No active deals yet</p>
          <Link to="/deals?action=create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Deal
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
            <div className="col-span-4">Deal</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-2 text-center">Progress</div>
            <div className="col-span-2 text-center">Days in Stage</div>
            <div className="col-span-2 text-right">Last Activity</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-50">
            {sortedDeals.slice(0, 8).map((deal, index) => (
              <div
                key={deal.id}
                onClick={() => navigate(`/deal/${deal.id}`)}
                className={`grid grid-cols-12 gap-4 px-4 py-4 items-center cursor-pointer transition-colors group ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } hover:bg-blue-50/50`}
              >
                {/* Deal Name */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div 
                    className={`w-2.5 h-2.5 rounded-full ${getHealthDot(deal.health_score)} flex-shrink-0`}
                    title={`Health: ${deal.health_score}%`}
                  />
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {deal.title}
                    </h4>
                    {deal.asking_price && (
                      <p className="text-xs text-gray-500">{deal.asking_price}</p>
                    )}
                  </div>
                </div>

                {/* Stage */}
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {formatStageName(deal.current_stage)}
                  </span>
                </div>

                {/* Progress */}
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-sm">{deal.document_completion}%</span>
                  </div>
                  {deal.pending_requests > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-sm">{deal.pending_requests}</span>
                    </div>
                  )}
                </div>

                {/* Days in Stage */}
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{deal.days_in_stage}d</span>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className="text-sm text-gray-400">
                    {deal.last_activity 
                      ? formatDistanceToNow(new Date(deal.last_activity), { addSuffix: true })
                      : 'No activity'
                    }
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {sortedDeals.length > 8 && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <Link to="/deals">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all {sortedDeals.length} deals →
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
