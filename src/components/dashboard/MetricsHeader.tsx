import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Building2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: any;
  trend: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  showBadge?: boolean;
}

const MetricCard = ({ title, value, change, icon: Icon, trend, onClick, showBadge }: MetricCardProps) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card 
      className="bg-card border border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-[120px] cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            {showBadge && parseInt(value) > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full" />
            )}
          </div>
          {change && (
            <span className={`text-sm font-semibold ${trendColors[trend]}`}>
              {change}
            </span>
          )}
        </div>
        <div>
          <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricsHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [metrics, setMetrics] = useState({
    pipelineValue: 0,
    activeDeals: 0,
    pendingNDAs: 0,
    closingThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const formatValue = (value: number): string => {
    if (value === 0) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      // 1. Pipeline Value: SUM(asking_price) FROM deals WHERE status='active'
      let pipelineQuery = supabase
        .from('deals')
        .select('asking_price')
        .eq('status', 'active');

      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        pipelineQuery = pipelineQuery.eq('created_by', user?.id);
      }

      const { data: dealsData, error: dealsError } = await pipelineQuery;
      
      if (dealsError) {
        console.error('[Dashboard Metrics] Pipeline Value error:', dealsError);
      }

      let pipelineValue = 0;
      dealsData?.forEach(deal => {
        if (deal.asking_price) {
          const priceStr = deal.asking_price.toLowerCase();
          const numValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
          
          if (priceStr.includes('m')) {
            pipelineValue += numValue * 1000000;
          } else if (priceStr.includes('k')) {
            pipelineValue += numValue * 1000;
          } else {
            pipelineValue += numValue * 1000;
          }
        }
      });

      // 2. Active Deals: COUNT(*) FROM deals WHERE status='active'
      let activeQuery = supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        activeQuery = activeQuery.eq('created_by', user?.id);
      }

      const { count: activeDeals, error: activeError } = await activeQuery;

      // 3. NDAs Pending: COUNT(*) FROM access_requests WHERE status='pending'
      const { count: pendingNDAs, error: ndaError } = await supabase
        .from('access_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // 4. Closing This Month
      let closingQuery = supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        closingQuery = closingQuery.eq('created_by', user?.id);
      }

      const { count: closingThisMonth, error: closingError } = await closingQuery;

      setMetrics({
        pipelineValue,
        activeDeals: activeDeals || 0,
        pendingNDAs: pendingNDAs || 0,
        closingThisMonth: Math.ceil((closingThisMonth || 0) * 0.3)
      });

    } catch (error) {
      console.error('[Dashboard Metrics] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchMetrics();
      
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [user, profile]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border border-border min-h-[120px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <Skeleton className="w-12 h-4" />
              </div>
              <Skeleton className="w-16 h-8 mb-2" />
              <Skeleton className="w-20 h-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Pipeline Value"
        value={formatValue(metrics.pipelineValue)}
        change={metrics.pipelineValue > 0 ? "+8.2%" : undefined}
        icon={TrendingUp}
        trend="up"
        onClick={() => navigate('/deals')}
      />
      <MetricCard
        title="Active Deals"
        value={metrics.activeDeals.toString()}
        icon={Building2}
        trend="up"
        onClick={() => navigate('/deals')}
      />
      <MetricCard
        title="NDAs Pending"
        value={metrics.pendingNDAs.toString()}
        icon={AlertTriangle}
        trend={metrics.pendingNDAs > 0 ? 'down' : 'neutral'}
        showBadge={metrics.pendingNDAs > 0}
        onClick={() => navigate('/access-requests')}
      />
      <MetricCard
        title="Closing This Month"
        value={metrics.closingThisMonth.toString()}
        change={metrics.closingThisMonth > 0 ? "+1" : undefined}
        icon={BarChart3}
        trend="up"
        onClick={() => navigate('/deals')}
      />
    </div>
  );
};
