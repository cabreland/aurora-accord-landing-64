import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductFeedback {
  id: string;
  created_at: string;
  created_by: string;
  page_path: string;
  page_context: Record<string, unknown> | null;
  type: string;
  severity: string | null;
  summary: string;
  details: string | null;
  status: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  // joined
  profile?: { first_name: string | null; last_name: string | null; email: string | null } | null;
}

export const FEEDBACK_TYPES = ['bug', 'idea', 'ui-copy', 'data-issue', 'other'] as const;
export const FEEDBACK_SEVERITIES = ['low', 'medium', 'high'] as const;
export const FEEDBACK_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;

export const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  idea: 'Idea',
  'ui-copy': 'UI / Copy',
  'data-issue': 'Data Issue',
  other: 'Other',
};

export const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

interface FeedbackFilters {
  status?: string;
  type?: string;
  search?: string;
}

export const useFeedbackList = (filters?: FeedbackFilters) => {
  return useQuery({
    queryKey: ['product-feedback', filters],
    queryFn: async () => {
      let query = supabase
        .from('product_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = (data || []) as ProductFeedback[];

      // Fetch profile info for authors
      const authorIds = [...new Set(results.map(r => r.created_by))];
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', authorIds);
        if (profiles) {
          const profileMap = new Map(profiles.map(p => [p.user_id, p]));
          results = results.map(r => ({
            ...r,
            profile: profileMap.get(r.created_by) || null,
          }));
        }
      }

      if (filters?.search) {
        const s = filters.search.toLowerCase();
        results = results.filter(r =>
          r.summary.toLowerCase().includes(s) ||
          r.details?.toLowerCase().includes(s) ||
          r.page_path.toLowerCase().includes(s)
        );
      }
      return results;
    },
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      created_by: string;
      page_path: string;
      page_context?: Record<string, unknown> | null;
      type: string;
      severity?: string;
      summary: string;
      details?: string;
    }) => {
      const insertData = {
          created_by: data.created_by,
          page_path: data.page_path,
          page_context: (data.page_context ?? null) as any,
          type: data.type,
          severity: data.severity ?? null,
          summary: data.summary,
          details: data.details ?? null,
          status: 'open' as const,
        };
      const { data: result, error } = await supabase
        .from('product_feedback')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-feedback'] });
    },
    onError: (error) => {
      toast.error('Failed to submit feedback: ' + error.message);
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      status?: string;
      resolution_notes?: string;
      resolved_at?: string | null;
      resolved_by?: string | null;
    }) => {
      const { error } = await supabase
        .from('product_feedback')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-feedback'] });
      toast.success('Feedback updated');
    },
    onError: (error) => {
      toast.error('Failed to update feedback: ' + error.message);
    },
  });
};
