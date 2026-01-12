import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Zap,
  MessageSquare,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { PipelineHealth, RecentActivity, DealHealth } from '@/hooks/useMissionControl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeroStatsProps {
  pipelineHealth: PipelineHealth;
  dealsRequiringAction: DealHealth[];
  thisWeeksClosings: DealHealth[];
  totalPipelineValue: number;
  recentActivities: RecentActivity[];
  loading: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

export const HeroStats: React.FC<HeroStatsProps> = ({
  pipelineHealth,
  dealsRequiringAction,
  thisWeeksClosings,
  totalPipelineValue,
  recentActivities,
  loading
}) => {
  const navigate = useNavigate();

  // Count activities from last 24 hours
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent24h = recentActivities.filter(a => new Date(a.timestamp) > last24Hours);
  const commentsCount = recent24h.filter(a => a.activity_type === 'comment_added').length;
  const uploadsCount = recent24h.filter(a => a.activity_type === 'document_uploaded').length;
  const completedCount = recent24h.filter(a => 
    a.activity_type === 'request_status_changed' || a.activity_type === 'document_approved'
  ).length;

  // Calculate urgent metrics
  const urgentCount = dealsRequiringAction.reduce((sum, d) => sum + d.urgent_items.length, 0);
  const overdueItems = dealsRequiringAction.reduce((sum, d) => 
    sum + d.urgent_items.filter(i => i.type === 'overdue').length, 0
  );
  const missingDocs = dealsRequiringAction.reduce((sum, d) => 
    sum + d.urgent_items.filter(i => i.type === 'missing').length, 0
  );

  // Calculate closing value
  const closingValue = thisWeeksClosings.reduce((sum, deal) => {
    const price = parseFloat(deal.asking_price?.replace(/[^0-9.]/g, '') || '0');
    let multiplier = 1;
    if (deal.asking_price?.toLowerCase().includes('k')) multiplier = 1000;
    if (deal.asking_price?.toLowerCase().includes('m')) multiplier = 1000000;
    if (deal.asking_price?.toLowerCase().includes('b')) multiplier = 1000000000;
    return sum + (price * multiplier);
  }, 0);

  // Mock goal progress (replace with real data)
  const goalPercent = Math.min(100, Math.round((closingValue / (closingValue * 1.3)) * 100));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-12 w-12 rounded-lg mb-4" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  const trendPercent = pipelineHealth.trend === 'up' ? 12 : pipelineHealth.trend === 'down' ? -8 : 0;
  const isPositive = trendPercent >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Pipeline Health */}
      <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{pipelineHealth.overall_score}%</p>
            <p className="text-sm text-gray-500">Pipeline Health</p>
          </div>
        </div>
        
        {/* Mini trend chart */}
        <div className="relative h-12 mb-3">
          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline
              points="0,35 15,30 30,32 45,25 60,28 75,18 90,20 100,12"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="opacity-80"
            />
            <polyline
              points="0,35 15,30 30,32 45,25 60,28 75,18 90,20 100,12"
              fill="url(#blueGradient)"
              stroke="none"
              className="opacity-20"
            />
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{pipelineHealth.total_deals} active deals</span>
          <span className={cn(
            "flex items-center gap-1 font-semibold",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{trendPercent}% vs last week
          </span>
        </div>
      </Card>

      {/* Requires Action - URGENT */}
      <Card className={cn(
        "rounded-xl p-6 shadow-lg text-white relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
        urgentCount > 0 
          ? "bg-gradient-to-br from-orange-500 to-red-500" 
          : "bg-gradient-to-br from-green-500 to-emerald-600"
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            {urgentCount > 0 ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
            {urgentCount > 0 && (
              <Badge className="bg-white text-red-600 font-bold shadow-sm">URGENT</Badge>
            )}
          </div>
          <p className="text-5xl font-bold mb-2">{urgentCount}</p>
          <p className="text-sm font-medium opacity-90 mb-4">
            {urgentCount > 0 ? 'Items Need Action' : 'All Caught Up!'}
          </p>
          {urgentCount > 0 ? (
            <>
              <div className="flex items-center gap-2 text-xs opacity-80">
                <span>{missingDocs} missing docs</span>
                <span>•</span>
                <span>{overdueItems} overdue</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                className="mt-4 w-full bg-white text-red-600 hover:bg-gray-100 font-semibold shadow-sm"
                onClick={() => navigate('/dashboard/diligence-tracker?filter=urgent')}
              >
                View All →
              </Button>
            </>
          ) : (
            <p className="text-xs opacity-70">No urgent items requiring attention</p>
          )}
        </div>
      </Card>

      {/* Closing Soon */}
      <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(closingValue)}</p>
            <p className="text-sm text-gray-500">Closing Soon</p>
          </div>
        </div>
        
        {/* Progress to goal */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500">To monthly goal</span>
            <span className="font-semibold text-gray-900">{goalPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-600">
          {thisWeeksClosings.length} deals in final stages
        </p>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{recent24h.length}</p>
            <p className="text-sm text-gray-500">Last 24 Hours</p>
          </div>
        </div>
        
        {/* Activity breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
              Comments
            </span>
            <span className="font-semibold text-gray-900">{commentsCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              Uploads
            </span>
            <span className="font-semibold text-gray-900">{uploadsCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Completed
            </span>
            <span className="font-semibold text-gray-900">{completedCount}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HeroStats;
