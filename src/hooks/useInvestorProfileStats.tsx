import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface InvestorProfileStats {
  dealsViewed: number;
  dealsWatchlisted: number;
  ndasSigned: number;
  interestsExpressed: number;
}

export interface InvestorActivity {
  id: string;
  type: 'view' | 'nda' | 'watchlist' | 'interest' | 'access_request' | 'document';
  description: string;
  dealName?: string;
  dealId?: string;
  timestamp: string;
}

export const useInvestorProfileStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<InvestorProfileStats>({
    dealsViewed: 0,
    dealsWatchlisted: 0,
    ndasSigned: 0,
    interestsExpressed: 0,
  });
  const [activities, setActivities] = useState<InvestorActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch watchlist count
        const { count: watchlistCount } = await supabase
          .from('deal_watchlist')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch NDA count
        const { count: ndaCount } = await supabase
          .from('company_nda_acceptances')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch interests count
        const { count: interestCount } = await supabase
          .from('deal_interests')
          .select('*', { count: 'exact', head: true })
          .eq('investor_id', user.id);

        // Fetch document views count (as proxy for deals viewed)
        const { count: viewCount } = await supabase
          .from('document_views')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats({
          dealsViewed: viewCount || 0,
          dealsWatchlisted: watchlistCount || 0,
          ndasSigned: ndaCount || 0,
          interestsExpressed: interestCount || 0,
        });

        // Fetch recent activities
        const recentActivities: InvestorActivity[] = [];

        // Get recent watchlist additions
        const { data: watchlistData } = await supabase
          .from('deal_watchlist')
          .select('id, deal_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (watchlistData) {
          for (const item of watchlistData) {
            recentActivities.push({
              id: item.id,
              type: 'watchlist',
              description: 'Added deal to watchlist',
              dealId: item.deal_id,
              timestamp: item.created_at,
            });
          }
        }

        // Get recent NDA signatures
        const { data: ndaData } = await supabase
          .from('company_nda_acceptances')
          .select('id, company_id, accepted_at')
          .eq('user_id', user.id)
          .order('accepted_at', { ascending: false })
          .limit(5);

        if (ndaData) {
          for (const item of ndaData) {
            recentActivities.push({
              id: item.id,
              type: 'nda',
              description: 'Signed NDA',
              dealId: item.company_id,
              timestamp: item.accepted_at,
            });
          }
        }

        // Get recent interests
        const { data: interestData } = await supabase
          .from('deal_interests')
          .select('id, deal_id, created_at')
          .eq('investor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (interestData) {
          for (const item of interestData) {
            recentActivities.push({
              id: item.id,
              type: 'interest',
              description: 'Expressed interest in deal',
              dealId: item.deal_id || undefined,
              timestamp: item.created_at || new Date().toISOString(),
            });
          }
        }

        // Sort all activities by timestamp and take top 10
        recentActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setActivities(recentActivities.slice(0, 10));

      } catch (error) {
        console.error('Error fetching investor stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return { stats, activities, loading, refetch: () => {} };
};
