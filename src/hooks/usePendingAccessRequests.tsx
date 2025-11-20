import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePendingAccessRequests = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCount();
      
      // Subscribe to changes
      const channel = supabase
        .channel('access_requests_count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'access_requests'
          },
          () => {
            fetchCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchCount = async () => {
    try {
      setLoading(true);
      
      const { count: pendingCount, error } = await supabase
        .from('access_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) {
        console.error('[usePendingAccessRequests] Error fetching count:', error);
        setCount(0);
      } else {
        setCount(pendingCount || 0);
      }
    } catch (error) {
      console.error('[usePendingAccessRequests] Error:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  return { count, loading, refresh: fetchCount };
};
