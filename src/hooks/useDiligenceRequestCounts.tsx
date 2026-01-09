import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RequestCounts {
  [requestId: string]: {
    documentCount: number;
    commentCount: number;
  };
}

export const useDiligenceRequestCounts = (dealId?: string) => {
  return useQuery({
    queryKey: ['diligence-request-counts', dealId],
    queryFn: async () => {
      // Get all request IDs for this deal
      let requestQuery = supabase
        .from('diligence_requests')
        .select('id');
      
      if (dealId) {
        requestQuery = requestQuery.eq('deal_id', dealId);
      }
      
      const { data: requests, error: requestsError } = await requestQuery;
      
      if (requestsError) throw requestsError;
      if (!requests || requests.length === 0) return {};
      
      const requestIds = requests.map(r => r.id);
      
      // Get document counts
      const { data: documents, error: docsError } = await supabase
        .from('diligence_documents')
        .select('request_id')
        .in('request_id', requestIds);
      
      if (docsError) throw docsError;
      
      // Get comment counts
      const { data: comments, error: commentsError } = await supabase
        .from('diligence_comments')
        .select('request_id')
        .in('request_id', requestIds);
      
      if (commentsError) throw commentsError;
      
      // Build counts map
      const counts: RequestCounts = {};
      
      for (const id of requestIds) {
        counts[id] = {
          documentCount: documents?.filter(d => d.request_id === id).length || 0,
          commentCount: comments?.filter(c => c.request_id === id).length || 0
        };
      }
      
      return counts;
    },
    enabled: true
  });
};
