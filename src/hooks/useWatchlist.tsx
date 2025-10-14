import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useWatchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('deal_watchlist')
        .select('deal_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const dealIds = new Set(data?.map(item => item.deal_id) || []);
      setWatchlist(dealIds);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async (dealId: string) => {
    if (!user) {
      toast.error('Please sign in to use watchlist');
      return;
    }

    const isWatched = watchlist.has(dealId);

    try {
      if (isWatched) {
        // Remove from watchlist
        const { error } = await supabase
          .from('deal_watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('deal_id', dealId);

        if (error) throw error;

        setWatchlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(dealId);
          return newSet;
        });
        toast.success('Removed from watchlist');
      } else {
        // Add to watchlist
        const { error } = await supabase
          .from('deal_watchlist')
          .insert({ user_id: user.id, deal_id: dealId });

        if (error) throw error;

        setWatchlist(prev => new Set(prev).add(dealId));
        toast.success('Added to watchlist');
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error('Failed to update watchlist');
    }
  };

  const isWatched = (dealId: string) => watchlist.has(dealId);

  return {
    watchlist,
    loading,
    toggleWatchlist,
    isWatched,
    watchlistCount: watchlist.size,
    refresh: fetchWatchlist
  };
};
