import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (!profile) return;

      const { data } = await supabase
        .from('conversations')
        .select('unread_count_investor, unread_count_broker');
      
      const total = data?.reduce((sum, conv) => {
        return sum + (profile.role === 'viewer' 
          ? conv.unread_count_investor 
          : conv.unread_count_broker);
      }, 0) || 0;
      
      setUnreadCount(total);
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
