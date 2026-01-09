import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DiligenceNotification {
  id: string;
  user_id: string;
  request_id: string | null;
  deal_id: string | null;
  type: 'assignment' | 'comment' | 'document' | 'status_change' | 'mention';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useDiligenceNotifications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['diligence-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('diligence_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as DiligenceNotification[];
    },
    enabled: !!user?.id
  });
};

export const useUnreadNotificationCount = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['diligence-notifications-unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('diligence_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('diligence_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications-unread-count', user?.id] });
    }
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('diligence_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications-unread-count', user?.id] });
    }
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      requestId,
      dealId,
      type,
      title,
      message
    }: {
      userId: string;
      requestId?: string;
      dealId?: string;
      type: DiligenceNotification['type'];
      title: string;
      message: string;
    }) => {
      const { data, error } = await supabase
        .from('diligence_notifications')
        .insert({
          user_id: userId,
          request_id: requestId || null,
          deal_id: dealId || null,
          type,
          title,
          message
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications-unread-count'] });
    }
  });
};
