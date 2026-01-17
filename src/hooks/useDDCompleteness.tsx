import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DDCompletenessMetrics {
  totalRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  openRequests: number;
  completionPercentage: number;
  isComplete: boolean;
}

export const useDDCompleteness = (dealId: string) => {
  // Fetch diligence requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['diligence-requests-completeness', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diligence_requests')
        .select('id, status')
        .eq('deal_id', dealId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!dealId
  });

  // Calculate completeness metrics
  const metrics = useMemo((): DDCompletenessMetrics => {
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;
    const openRequests = requests.filter(r => r.status === 'open').length;
    
    const completionPercentage = totalRequests > 0 
      ? Math.round((completedRequests / totalRequests) * 100)
      : 0;
    
    return {
      totalRequests,
      completedRequests,
      inProgressRequests,
      openRequests,
      completionPercentage,
      isComplete: completionPercentage === 100
    };
  }, [requests]);

  return {
    ...metrics,
    isLoading
  };
};
