import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const { data } = await supabase
          .from('conversations' as any)
          .select('unread_count_investor, unread_count_broker');

        const total = data?.reduce((sum: number, conv: any) => {
          return sum + (profile?.role === 'viewer' 
            ? (conv.unread_count_investor || 0)
            : (conv.unread_count_broker || 0));
        }, 0) || 0;

        setUnreadCount(total);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to changes
    const subscription = supabase
      .channel('unread_counts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'conversations' 
      }, fetchUnreadCount)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return unreadCount;
};
