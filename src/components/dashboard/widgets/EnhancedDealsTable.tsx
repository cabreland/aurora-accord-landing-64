import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Plus,
  Building2
} from 'lucide-react';
import { DealHealth } from '@/hooks/useMissionControl';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedDealsTableProps {
  deals: DealHealth[];
  loading: boolean;
}

type SortOption = 'health_worst' | 'value_high' | 'activity_recent' | 'stage';

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

const getHealthColor = (score: number) => {
  if (score >= 70) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
};

export const EnhancedDealsTable: React.FC<EnhancedDealsTableProps> = ({
  deals,
  loading
}) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('health_worst');

  const activeDeals = deals.filter(d => d.status === 'active');

  const sortedDeals = [...activeDeals].sort((a, b) => {
    switch (sortBy) {
      case 'health_worst':
        return a.health_score - b.health_score;
      case 'value_high':
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
      case 'activity_recent':
        return new Date(b.last_activity || 0).getTime() - new Date(a.last_activity || 0).getTime();
      case 'stage':
        const stageOrder = ['closing', 'final_review', 'analysis', 'information_request', 'deal_initiated'];
        return stageOrder.indexOf(a.current_stage) - stageOrder.indexOf(b.current_stage);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-48" />
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
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Active Deals</h3>
          <p className="text-sm text-gray-500 mt-0.5">{activeDeals.length} deals in progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[180px] h-9 bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="health_worst">Health (worst first)</SelectItem>
              <SelectItem value="value_high">Value (highest)</SelectItem>
              <SelectItem value="activity_recent">Recent activity</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
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
          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Health
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Issues
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Days in Stage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedDeals.slice(0, 8).map((deal, index) => {
                  const initials = (deal.company_name || deal.title).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  const healthColor = getHealthColor(deal.health_score);
                  const progressPercent = deal.document_completion;
                  const issueCount = deal.urgent_items.length;
                  
                  return (
                    <tr 
                      key={deal.id}
                      className={cn(
                        "hover:bg-blue-50/50 transition-colors cursor-pointer group",
                        index % 2 === 1 && "bg-gray-50/30"
                      )}
                      onClick={() => navigate(`/deal/${deal.id}`)}
                    >
                      {/* Deal Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0",
                              deal.health_score >= 70 ? "bg-green-500" :
                              deal.health_score >= 50 ? "bg-yellow-500" : "bg-red-500"
                            )} 
                          />
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {deal.company_name || deal.title}
                            </p>
                            <p className="text-xs text-gray-500">{deal.asking_price || 'No value set'}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Stage */}
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs font-medium bg-gray-50">
                          {formatStageName(deal.current_stage)}
                        </Badge>
                      </td>
                      
                      {/* Health Score - Circular */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <div className="relative w-12 h-12">
                            <svg className="transform -rotate-90 w-12 h-12">
                              <circle
                                cx="24"
                                cy="24"
                                r="18"
                                stroke="#E5E7EB"
                                strokeWidth="3"
                                fill="none"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="18"
                                stroke={healthColor}
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray={`${(deal.health_score / 100) * 113} 113`}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-900">
                                {deal.health_score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Progress */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-24">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Docs</span>
                              <span className="font-semibold text-gray-900">{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  progressPercent >= 70 ? "bg-green-500" : 
                                  progressPercent >= 40 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Issues */}
                      <td className="px-6 py-4 text-center">
                        {issueCount > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-full">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs font-semibold text-red-700">{issueCount}</span>
                          </div>
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        )}
                      </td>
                      
                      {/* Days in Stage */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-medium tabular-nums">{deal.days_in_stage}d</span>
                        </div>
                      </td>
                      
                      {/* Last Activity */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-500">
                          {deal.last_activity 
                            ? formatDistanceToNow(new Date(deal.last_activity), { addSuffix: false })
                            : 'No activity'
                          }
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedDeals.length > 8 && (
            <div className="px-6 py-4 border-t border-gray-100 text-center bg-gray-50/30">
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

export default EnhancedDealsTable;
