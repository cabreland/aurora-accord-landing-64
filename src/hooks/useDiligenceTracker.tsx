import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DiligenceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  order_index: number;
  created_at: string;
}

export interface DiligenceSubcategory {
  id: string;
  category_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface DiligenceRequest {
  id: string;
  deal_id: string;
  category_id: string;
  subcategory_id: string | null;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed' | 'blocked';
  assignee_id: string | null;
  reviewer_ids: string[];
  due_date: string | null;
  completion_date: string | null;
  document_ids: string[];
  notes: string | null;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: DiligenceCategory;
  subcategory?: DiligenceSubcategory;
}

export interface DiligenceTemplate {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  deal_type: string | null;
  template_data: {
    categories: Array<{
      name: string;
      requests: Array<{
        title: string;
        priority: 'high' | 'medium' | 'low';
        description: string;
      }>;
    }>;
  };
  is_default: boolean;
  created_by: string | null;
  created_at: string;
}

export interface DiligenceComment {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface DealWithDiligence {
  id: string;
  company_name: string;
  title: string;
  status: string;
  total_requests: number;
  completed_requests: number;
  progress_percentage: number;
}

export const useDiligenceCategories = () => {
  return useQuery({
    queryKey: ['diligence-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diligence_categories')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as DiligenceCategory[];
    }
  });
};

export const useDiligenceSubcategories = () => {
  return useQuery({
    queryKey: ['diligence-subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diligence_subcategories')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as DiligenceSubcategory[];
    }
  });
};

export const useDiligenceTemplates = () => {
  return useQuery({
    queryKey: ['diligence-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diligence_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DiligenceTemplate[];
    }
  });
};

export const useDiligenceRequests = (dealId?: string) => {
  return useQuery({
    queryKey: ['diligence-requests', dealId],
    queryFn: async () => {
      let query = supabase
        .from('diligence_requests')
        .select(`
          *,
          category:diligence_categories(*),
          subcategory:diligence_subcategories(*)
        `)
        .order('order_index');
      
      if (dealId) {
        query = query.eq('deal_id', dealId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as DiligenceRequest[];
    },
    enabled: true
  });
};

export const useDiligenceComments = (requestId: string) => {
  return useQuery({
    queryKey: ['diligence-comments', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diligence_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DiligenceComment[];
    },
    enabled: !!requestId
  });
};

export const useDealsWithDiligence = () => {
  return useQuery({
    queryKey: ['deals-with-diligence'],
    queryFn: async () => {
      // Get all deals
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id, company_name, title, status')
        .eq('status', 'active');
      
      if (dealsError) throw dealsError;
      
      // Get request counts per deal
      const { data: requests, error: requestsError } = await supabase
        .from('diligence_requests')
        .select('deal_id, status');
      
      if (requestsError) throw requestsError;
      
      // Calculate progress for each deal
      const dealsWithProgress: DealWithDiligence[] = deals.map(deal => {
        const dealRequests = requests.filter(r => r.deal_id === deal.id);
        const total = dealRequests.length;
        const completed = dealRequests.filter(r => r.status === 'completed').length;
        
        return {
          ...deal,
          total_requests: total,
          completed_requests: completed,
          progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      });
      
      return dealsWithProgress;
    }
  });
};

export const useCreateDiligenceRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (request: Partial<DiligenceRequest>) => {
      const { data, error } = await supabase
        .from('diligence_requests')
        .insert({
          deal_id: request.deal_id!,
          category_id: request.category_id!,
          subcategory_id: request.subcategory_id || null,
          title: request.title!,
          description: request.description || null,
          priority: request.priority || 'medium',
          status: request.status || 'open',
          due_date: request.due_date || null,
          order_index: request.order_index || 0,
          created_by: user?.id!
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-requests', variables.deal_id] });
      queryClient.invalidateQueries({ queryKey: ['deals-with-diligence'] });
      toast.success('Request created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create request');
      console.error(error);
    }
  });
};

export const useUpdateDiligenceRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DiligenceRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('diligence_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-requests', data.deal_id] });
      queryClient.invalidateQueries({ queryKey: ['deals-with-diligence'] });
      toast.success('Request updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update request');
      console.error(error);
    }
  });
};

export const useDeleteDiligenceRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, dealId }: { id: string; dealId: string }) => {
      const { error } = await supabase
        .from('diligence_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, dealId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-requests', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals-with-diligence'] });
      toast.success('Request deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete request');
      console.error(error);
    }
  });
};

export const useAddDiligenceComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ requestId, content }: { requestId: string; content: string }) => {
      const { data, error } = await supabase
        .from('diligence_comments')
        .insert({
          request_id: requestId,
          user_id: user?.id,
          content
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-comments', variables.requestId] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error(error);
    }
  });
};

export const useApplyDiligenceTemplate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ dealId, templateId }: { dealId: string; templateId: string }) => {
      // Get the template
      const { data: template, error: templateError } = await supabase
        .from('diligence_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (templateError) throw templateError;
      
      // Get categories
      const { data: categories, error: catError } = await supabase
        .from('diligence_categories')
        .select('*');
      
      if (catError) throw catError;
      
      // Create requests from template
      const templateData = template.template_data as DiligenceTemplate['template_data'];
      const requestsToInsert: Array<{
        deal_id: string;
        category_id: string;
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
        status: 'open';
        order_index: number;
        created_by: string;
      }> = [];
      let orderIndex = 0;
      
      for (const cat of templateData.categories) {
        const category = categories.find(c => c.name === cat.name);
        if (!category) continue;
        
        for (const req of cat.requests) {
          requestsToInsert.push({
            deal_id: dealId,
            category_id: category.id,
            title: req.title,
            description: req.description,
            priority: req.priority,
            status: 'open',
            order_index: orderIndex++,
            created_by: user?.id!
          });
        }
      }
      
      if (requestsToInsert.length > 0) {
        const { error } = await supabase
          .from('diligence_requests')
          .insert(requestsToInsert);
        
        if (error) throw error;
      }
      
      return { dealId, count: requestsToInsert.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-requests', data.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals-with-diligence'] });
      toast.success(`Created ${data.count} diligence requests`);
    },
    onError: (error) => {
      toast.error('Failed to apply template');
      console.error(error);
    }
  });
};
