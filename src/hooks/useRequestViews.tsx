import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RequestView {
  request_id: string;
  user_id: string;
  last_viewed_at: string;
}

/**
 * Hook to manage request view tracking for update indicators
 */
export const useRequestViews = (dealId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['diligence-request-views', user?.id, dealId],
    queryFn: async (): Promise<Record<string, string>> => {
      if (!user?.id) return {};

      const { data, error } = await supabase
        .from('diligence_request_views')
        .select('request_id, last_viewed_at')
        .eq('user_id', user.id);

      if (error) throw error;

      // Convert to record for easy lookup
      const viewMap: Record<string, string> = {};
      (data || []).forEach((view) => {
        viewMap[view.request_id] = view.last_viewed_at;
      });
      return viewMap;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to mark a request as viewed
 */
export const useMarkRequestViewed = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user?.id) return;

      const { error } = await supabase
        .from('diligence_request_views')
        .upsert({
          request_id: requestId,
          user_id: user.id,
          last_viewed_at: new Date().toISOString(),
        }, {
          onConflict: 'request_id,user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diligence-request-views'] });
    },
  });
};

/**
 * Check if a request has unread updates
 * Returns true if last_activity_at > last_viewed_at or if never viewed
 */
export const hasUnreadUpdates = (
  requestId: string,
  lastActivityAt: string | null,
  viewMap: Record<string, string>
): boolean => {
  if (!lastActivityAt) return false;
  
  const lastViewed = viewMap[requestId];
  if (!lastViewed) return true; // Never viewed = unread
  
  return new Date(lastActivityAt) > new Date(lastViewed);
};

/**
 * Check if request was updated within the last 24 hours
 */
export const isRecentlyUpdated = (lastActivityAt: string | null): boolean => {
  if (!lastActivityAt) return false;
  
  const activityTime = new Date(lastActivityAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff < 24;
};
