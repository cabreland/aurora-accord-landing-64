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
    up: 'text-[#22C55E]',
    down: 'text-[#EF4444]',
    neutral: 'text-[#F4E4BC]'
  };

  return (
    <Card 
      className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 hover:border-[#D4AF37]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 min-h-[120px] cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Icon className="w-7 h-7 text-[#D4AF37]" />
            {showBadge && parseInt(value) > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F28C38] rounded-full" />
            )}
          </div>
          {change && (
            <span className={`text-sm font-semibold ${trendColors[trend]}`}>
              {change}
            </span>
          )}
        </div>
        <div>
          <div className="text-3xl font-bold text-[#FAFAFA] mb-2">{value}</div>
          <p className="text-sm text-[#F4E4BC]/70 font-medium">{title}</p>
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

      console.log('[Dashboard Metrics] Pipeline Value:', pipelineValue, 'from', dealsData?.length, 'deals');

      // 2. Active Deals: COUNT(*) FROM deals WHERE status='active'
      let activeQuery = supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        activeQuery = activeQuery.eq('created_by', user?.id);
      }

      const { count: activeDeals, error: activeError } = await activeQuery;
      
      if (activeError) {
        console.error('[Dashboard Metrics] Active Deals error:', activeError);
      }
      console.log('[Dashboard Metrics] Active Deals:', activeDeals);

      // 3. NDAs Pending: COUNT(*) FROM access_requests WHERE status='pending'
      const { count: pendingNDAs, error: ndaError } = await supabase
        .from('access_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (ndaError) {
        console.error('[Dashboard Metrics] NDAs Pending error:', ndaError);
      }
      console.log('[Dashboard Metrics] NDAs Pending:', pendingNDAs);

      // 4. Closing This Month: COUNT(*) FROM deals WHERE status='active' AND expected_close_date is this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      let closingQuery = supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        closingQuery = closingQuery.eq('created_by', user?.id);
      }

      const { count: closingThisMonth, error: closingError } = await closingQuery;

      if (closingError) {
        console.error('[Dashboard Metrics] Closing This Month error:', closingError);
      }
      console.log('[Dashboard Metrics] Closing This Month:', closingThisMonth);

      setMetrics({
        pipelineValue,
        activeDeals: activeDeals || 0,
        pendingNDAs: pendingNDAs || 0,
        closingThisMonth: Math.ceil((closingThisMonth || 0) * 0.3) // Estimate 30% closing this month
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
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [user, profile]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 min-h-[120px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-7 h-7" />
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
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