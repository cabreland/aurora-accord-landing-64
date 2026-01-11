import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  BarChart3, 
  Clock, 
  Users, 
  FileText,
  MessageSquare,
  Upload,
  Activity,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { DealHealth } from '@/hooks/useMissionControl';
import { formatDistanceToNow } from 'date-fns';

interface ActiveDealsWidgetProps {
  deals: DealHealth[];
  loading: boolean;
}

type SortOption = 'health' | 'activity' | 'stage' | 'value';

const getHealthDot = (score: number) => {
  if (score >= 70) return 'bg-success';
  if (score >= 50) return 'bg-warning';
  return 'bg-destructive';
};

const getStageBadgeColor = (stage: string) => {
  switch (stage) {
    case 'closing': return 'bg-success/10 text-success border-success/20';
    case 'final_review': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'analysis': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'information_request': return 'bg-warning/10 text-warning border-warning/20';
    case 'deal_initiated': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-secondary text-muted-foreground border-border';
  }
};

const formatStageName = (stage: string) => {
  return stage
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
        return a.health_score - b.health_score; // Worst first
      case 'activity':
        return new Date(a.last_activity || 0).getTime() - new Date(b.last_activity || 0).getTime(); // Stale first
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
      <Card className="p-6 bg-card border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Active Deals</h3>
            <p className="text-xs text-muted-foreground">{activeDeals.length} deal{activeDeals.length !== 1 ? 's' : ''} in progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px] h-9">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="health">Health (worst)</SelectItem>
              <SelectItem value="activity">Activity (stale)</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
              <SelectItem value="value">Value</SelectItem>
            </SelectContent>
          </Select>
          <Link to="/deals">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </div>

      {sortedDeals.length === 0 ? (
        <div className="py-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No active deals</p>
          <Link to="/deals?action=create">
            <Button variant="outline" className="mt-4">
              Create First Deal
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDeals.slice(0, 6).map((deal) => (
            <div
              key={deal.id}
              onClick={() => navigate(`/deal/${deal.id}`)}
              className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all cursor-pointer group"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Health indicator */}
                  <div className={`w-3 h-3 rounded-full ${getHealthDot(deal.health_score)} flex-shrink-0`} 
                       title={`Health: ${deal.health_score}%`} />
                  <h4 className="font-semibold text-foreground truncate">{deal.title}</h4>
                  <Badge className={`text-xs flex-shrink-0 ${getStageBadgeColor(deal.current_stage)}`}>
                    {formatStageName(deal.current_stage)}
                  </Badge>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>

              {/* Metrics Row */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{deal.days_in_stage}d in stage</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{deal.document_completion}%</span>
                </div>
                {deal.pending_requests > 0 && (
                  <div className="flex items-center gap-1.5 text-warning">
                    <MessageSquare className="w-4 h-4" />
                    <span>{deal.pending_requests} open</span>
                  </div>
                )}
                {deal.last_activity && (
                  <div className="flex items-center gap-1.5 text-muted-foreground ml-auto text-xs">
                    <Activity className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(deal.last_activity), { addSuffix: true })}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions - show on hover */}
              <div className="mt-3 pt-3 border-t border-border/50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/deal/${deal.id}/data-room`);
                  }}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Documents
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/deal/${deal.id}/requests`);
                  }}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Requests
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/deal/${deal.id}/activity`);
                  }}
                >
                  <Activity className="w-3 h-3 mr-1" />
                  Activity
                </Button>
              </div>
            </div>
          ))}

          {sortedDeals.length > 6 && (
            <Link to="/deals" className="block">
              <Button variant="outline" className="w-full">
                View All {sortedDeals.length} Deals
              </Button>
            </Link>
          )}
        </div>
      )}
    </Card>
  );
};
