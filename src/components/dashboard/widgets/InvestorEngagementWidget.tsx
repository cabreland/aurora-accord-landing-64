import React from 'react';
import { WidgetContainer } from '../shared/WidgetContainer';
import { Users, Heart, FileCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const InvestorEngagementWidget = () => {
  const [stats, setStats] = React.useState({
    ndasSigned: 0,
    interestExpressed: 0,
    watchlisted: 0
  });
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ndasResult, interestResult, watchlistResult] = await Promise.all([
          supabase.from('company_nda_acceptances').select('id', { count: 'exact', head: true }),
          supabase.from('deal_interests').select('id', { count: 'exact', head: true }),
          supabase.from('deal_watchlist').select('id', { count: 'exact', head: true })
        ]);

        setStats({
          ndasSigned: ndasResult.count || 0,
          interestExpressed: interestResult.count || 0,
          watchlisted: watchlistResult.count || 0
        });
      } catch (error) {
        console.error('Error fetching engagement stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <WidgetContainer title="Investor Engagement" icon={Users}>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </WidgetContainer>
    );
  }

  const metrics = [
    {
      label: 'NDAs Signed',
      value: stats.ndasSigned,
      trend: '+12%',
      trendUp: true,
      icon: FileCheck,
      path: '/dashboard/ndas',
      color: '#22C55E'
    },
    {
      label: 'Interest Expressed',
      value: stats.interestExpressed,
      trend: '+8%',
      trendUp: true,
      icon: Heart,
      path: '/deals',
      color: '#F59E0B'
    },
    {
      label: 'Watchlisted Deals',
      value: stats.watchlisted,
      trend: '+5%',
      trendUp: true,
      icon: Users,
      path: '/deals',
      color: '#3B82F6'
    }
  ];

  return (
    <WidgetContainer title="Investor Engagement" icon={Users}>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trendUp ? TrendingUp : TrendingDown;
          
          return (
            <button
              key={metric.label}
              onClick={() => navigate(metric.path)}
              className="bg-[#1A1F2E] hover:bg-[#2A2F3A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 rounded-lg p-4 transition-all duration-200 text-left group hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  metric.trendUp ? 'text-[#22C55E]' : 'text-[#EF4444]'
                }`}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{metric.trend}</span>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-[#FAFAFA] mb-1 group-hover:text-[#D4AF37] transition-colors">
                {metric.value}
              </div>
              
              <p className="text-xs text-[#F4E4BC]/70 font-medium">
                {metric.label}
              </p>
            </button>
          );
        })}
      </div>

      {stats.ndasSigned === 0 && stats.interestExpressed === 0 && stats.watchlisted === 0 && (
        <div className="text-center py-6 mt-4">
          <Users className="w-8 h-8 text-[#D4AF37]/50 mx-auto mb-2" />
          <p className="text-sm text-[#F4E4BC]/60">No investor engagement yet</p>
        </div>
      )}
    </WidgetContainer>
  );
};
