import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DealRequest {
  id: string;
  deal_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  asked_by: string | null;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  response_count?: number;
  document_count?: number;
  asked_by_profile?: { first_name: string | null; last_name: string | null; email: string | null };
  assigned_to_profile?: { first_name: string | null; last_name: string | null; email: string | null };
}

export interface RequestResponse {
  id: string;
  request_id: string;
  user_id: string | null;
  response_text: string;
  created_at: string;
  user_profile?: { first_name: string | null; last_name: string | null; email: string | null };
}

export interface RequestDocument {
  id: string;
  request_id: string;
  document_id: string | null;
  data_room_document_id: string | null;
  attached_by: string | null;
  created_at: string;
  document?: { id: string; name: string; file_path: string };
  data_room_document?: { id: string; file_name: string; file_path: string };
}

export const REQUEST_CATEGORIES = [
  'Financial',
  'Legal',
  'Operations',
  'Technical',
  'Customer',
  'HR',
  'Other'
] as const;

export const REQUEST_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const REQUEST_STATUSES = ['Open', 'In Progress', 'Answered', 'Closed'] as const;

export const useDealRequests = (dealId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch all requests for a deal
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['deal-requests', dealId],
    queryFn: async () => {
      if (!dealId) return [];

      const { data: requestsData, error } = await supabase
        .from('deal_requests')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get response counts and document counts for each request
      const requestsWithCounts = await Promise.all(
        (requestsData || []).map(async (request) => {
          const [responseCountResult, docCountResult] = await Promise.all([
            supabase
              .from('request_responses')
              .select('id', { count: 'exact', head: true })
              .eq('request_id', request.id),
            supabase
              .from('request_documents')
              .select('id', { count: 'exact', head: true })
              .eq('request_id', request.id)
          ]);

          return {
            ...request,
            response_count: responseCountResult.count || 0,
            document_count: docCountResult.count || 0
          };
        })
      );

      return requestsWithCounts as DealRequest[];
    },
    enabled: !!dealId
  });

  // Fetch single request with responses and documents
  const useRequestDetail = (requestId: string | null) => {
    return useQuery({
      queryKey: ['deal-request-detail', requestId],
      queryFn: async () => {
        if (!requestId) return null;

        const [requestResult, responsesResult, documentsResult] = await Promise.all([
          supabase.from('deal_requests').select('*').eq('id', requestId).single(),
          supabase
            .from('request_responses')
            .select('*')
            .eq('request_id', requestId)
            .order('created_at', { ascending: true }),
          supabase
            .from('request_documents')
            .select(`
              *,
              document:documents(id, name, file_path),
              data_room_document:data_room_documents(id, file_name, file_path)
            `)
            .eq('request_id', requestId)
        ]);

        if (requestResult.error) throw requestResult.error;

        return {
          request: requestResult.data as DealRequest,
          responses: (responsesResult.data || []) as RequestResponse[],
          documents: (documentsResult.data || []) as RequestDocument[]
        };
      },
      enabled: !!requestId
    });
  };

  // Create new request
  const createRequest = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      category: string;
      priority: string;
      assigned_to?: string;
      due_date?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data: newRequest, error } = await supabase
        .from('deal_requests')
        .insert({
          deal_id: dealId,
          title: data.title,
          description: data.description || null,
          category: data.category,
          priority: data.priority,
          status: 'Open',
          asked_by: userData.user.id,
          assigned_to: data.assigned_to || null,
          due_date: data.due_date || null
        })
        .select()
        .single();

      if (error) throw error;
      return newRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-requests', dealId] });
      toast.success('Request created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create request: ' + error.message);
    }
  });

  // Update request
  const updateRequest = useMutation({
    mutationFn: async ({ requestId, updates }: { requestId: string; updates: Partial<DealRequest> }) => {
      const { data, error } = await supabase
        .from('deal_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-requests', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-request-detail', variables.requestId] });
      toast.success('Request updated');
    },
    onError: (error) => {
      toast.error('Failed to update request: ' + error.message);
    }
  });

  // Add response to request
  const addResponse = useMutation({
    mutationFn: async ({ requestId, responseText }: { requestId: string; responseText: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('request_responses')
        .insert({
          request_id: requestId,
          user_id: userData.user.id,
          response_text: responseText
        })
        .select()
        .single();

      if (error) throw error;

      // Update request status to In Progress if it was Open
      await supabase
        .from('deal_requests')
        .update({ status: 'In Progress' })
        .eq('id', requestId)
        .eq('status', 'Open');

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-requests', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-request-detail', variables.requestId] });
      toast.success('Response added');
    },
    onError: (error) => {
      toast.error('Failed to add response: ' + error.message);
    }
  });

  // Attach document to request
  const attachDocument = useMutation({
    mutationFn: async ({ requestId, documentId, dataRoomDocumentId }: { 
      requestId: string; 
      documentId?: string;
      dataRoomDocumentId?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('request_documents')
        .insert({
          request_id: requestId,
          document_id: documentId || null,
          data_room_document_id: dataRoomDocumentId || null,
          attached_by: userData.user?.id || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-request-detail', variables.requestId] });
      toast.success('Document attached');
    },
    onError: (error) => {
      toast.error('Failed to attach document: ' + error.message);
    }
  });

  // Remove document from request
  const removeDocument = useMutation({
    mutationFn: async ({ attachmentId, requestId }: { attachmentId: string; requestId: string }) => {
      const { error } = await supabase
        .from('request_documents')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-request-detail', variables.requestId] });
      toast.success('Document removed');
    },
    onError: (error) => {
      toast.error('Failed to remove document: ' + error.message);
    }
  });

  // Metrics calculation
  const metrics = {
    total: requests.length,
    open: requests.filter(r => r.status === 'Open').length,
    inProgress: requests.filter(r => r.status === 'In Progress').length,
    answered: requests.filter(r => r.status === 'Answered').length,
    closed: requests.filter(r => r.status === 'Closed').length,
    overdue: requests.filter(r => r.due_date && new Date(r.due_date) < new Date() && r.status !== 'Closed').length
  };

  return {
    requests,
    isLoading,
    refetch,
    metrics,
    createRequest,
    updateRequest,
    addResponse,
    attachDocument,
    removeDocument,
    useRequestDetail
  };
};
