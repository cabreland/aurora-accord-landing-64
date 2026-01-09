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
  assignee_id: string | null; // Legacy - kept for backwards compatibility
  assignee_ids: string[]; // New: multiple assignees
  reviewer_ids: string[];
  due_date: string | null;
  completion_date: string | null;
  document_ids: string[];
  notes: string | null;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  // New columns from migration
  last_activity_at: string | null;
  risk_score: number | null;
  stage: 'early' | 'due_diligence' | 'final_review' | 'closed' | null;
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
  comment_type: 'internal' | 'approved';
  parent_comment_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined profile data
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  // Approver profile for approved comments
  approver_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  // Nested replies for threading
  replies?: DiligenceComment[];
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
      // Fetch all comments including new fields
      const { data: comments, error } = await supabase
        .from('diligence_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (!comments || comments.length === 0) {
        return [] as DiligenceComment[];
      }
      
      // Get unique user IDs from comments (authors and approvers)
      const userIds = new Set<string>();
      comments.forEach(c => {
        userIds.add(c.user_id);
        if (c.approved_by) userIds.add(c.approved_by);
      });
      
      // Fetch profiles for those users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', Array.from(userIds));
      
      // Map profiles
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      // Separate top-level comments and replies
      const topLevelComments: DiligenceComment[] = [];
      const repliesMap = new Map<string, DiligenceComment[]>();
      
      comments.forEach(comment => {
        const commentType: 'internal' | 'approved' = comment.comment_type === 'approved' ? 'approved' : 'internal';
        const enrichedComment: DiligenceComment = {
          ...comment,
          comment_type: commentType,
          profile: profileMap.get(comment.user_id) || null,
          approver_profile: comment.approved_by ? profileMap.get(comment.approved_by) || null : null,
          replies: []
        };
        
        if (comment.parent_comment_id) {
          const parentReplies = repliesMap.get(comment.parent_comment_id) || [];
          parentReplies.push(enrichedComment);
          repliesMap.set(comment.parent_comment_id, parentReplies);
        } else {
          topLevelComments.push(enrichedComment);
        }
      });
      
      // Attach replies to parent comments
      topLevelComments.forEach(comment => {
        comment.replies = repliesMap.get(comment.id) || [];
      });
      
      return topLevelComments;
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
          created_by: user?.id!,
          assignee_id: request.assignee_id || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification if assigned to someone
      if (request.assignee_id && request.assignee_id !== user?.id) {
        await supabase.from('diligence_notifications').insert({
          user_id: request.assignee_id,
          request_id: data.id,
          deal_id: request.deal_id,
          type: 'assignment',
          title: 'New Assignment',
          message: `You've been assigned to "${request.title}"`
        });
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-requests', variables.deal_id] });
      queryClient.invalidateQueries({ queryKey: ['deals-with-diligence'] });
      queryClient.invalidateQueries({ queryKey: ['diligence-request-counts', variables.deal_id] });
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
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DiligenceRequest> & { id: string }) => {
      // Get original request to check for changes
      const { data: original } = await supabase
        .from('diligence_requests')
        .select('assignee_id, assignee_ids, status, title, deal_id')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('diligence_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notifications for changes
      const notifications: Array<{
        user_id: string;
        request_id: string;
        deal_id: string | null;
        type: string;
        title: string;
        message: string;
      }> = [];
      
      // Handle multiple assignees notifications
      if (updates.assignee_ids) {
        const originalIds = original?.assignee_ids || [];
        const newIds = updates.assignee_ids || [];
        
        // Find newly added assignees
        const addedAssignees = newIds.filter(id => !originalIds.includes(id) && id !== user?.id);
        
        // Create notification for each new assignee
        for (const assigneeId of addedAssignees) {
          notifications.push({
            user_id: assigneeId,
            request_id: id,
            deal_id: data.deal_id,
            type: 'assignment',
            title: 'New Assignment',
            message: `You've been assigned to "${original?.title || data.title}"`
          });
        }
      }
      
      // Legacy: single assignee support
      if (updates.assignee_id && updates.assignee_id !== original?.assignee_id && updates.assignee_id !== user?.id) {
        notifications.push({
          user_id: updates.assignee_id,
          request_id: id,
          deal_id: data.deal_id,
          type: 'assignment',
          title: 'New Assignment',
          message: `You've been assigned to "${original?.title || data.title}"`
        });
      }
      
      // Notify if status changed (notify all assignees)
      if (updates.status && updates.status !== original?.status) {
        const assigneeIds = data.assignee_ids || [];
        const assigneesToNotify = assigneeIds.filter((id: string) => id !== user?.id);
        
        for (const assigneeId of assigneesToNotify) {
          notifications.push({
            user_id: assigneeId,
            request_id: id,
            deal_id: data.deal_id,
            type: 'status_change',
            title: 'Status Changed',
            message: `Status changed to "${updates.status}" on "${original?.title || data.title}"`
          });
        }
      }
      
      // Insert all notifications
      if (notifications.length > 0) {
        await supabase.from('diligence_notifications').insert(notifications);
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-requests', data.deal_id] });
      queryClient.invalidateQueries({ queryKey: ['deals-with-diligence'] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications-unread-count'] });
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
    mutationFn: async ({ 
      requestId, 
      content, 
      commentType = 'internal',
      parentCommentId = null,
      approveImmediately = false 
    }: { 
      requestId: string; 
      content: string;
      commentType?: 'internal' | 'approved';
      parentCommentId?: string | null;
      approveImmediately?: boolean;
    }) => {
      // Get request details for notification
      const { data: request } = await supabase
        .from('diligence_requests')
        .select('title, assignee_id, deal_id, created_by')
        .eq('id', requestId)
        .single();
      
      const insertData = {
        request_id: requestId,
        user_id: user?.id,
        content,
        comment_type: approveImmediately ? 'approved' : commentType,
        parent_comment_id: parentCommentId,
        approved_by: approveImmediately ? user?.id : null,
        approved_at: approveImmediately ? new Date().toISOString() : null
      };
      
      const { data, error } = await supabase
        .from('diligence_comments')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Get all previous commenters to notify
      const { data: previousComments } = await supabase
        .from('diligence_comments')
        .select('user_id')
        .eq('request_id', requestId)
        .neq('user_id', user?.id);
      
      const usersToNotify = new Set<string>();
      
      // Add assignee
      if (request?.assignee_id && request.assignee_id !== user?.id) {
        usersToNotify.add(request.assignee_id);
      }
      
      // Add creator
      if (request?.created_by && request.created_by !== user?.id) {
        usersToNotify.add(request.created_by);
      }
      
      // Add previous commenters
      previousComments?.forEach(c => {
        if (c.user_id !== user?.id) {
          usersToNotify.add(c.user_id);
        }
      });
      
      // Get current user's name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user?.id)
        .single();
      
      const commenterName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Someone' : 'Someone';
      
      // Create notifications
      const notificationType = approveImmediately ? 'approved_answer' : 'comment';
      const notificationTitle = approveImmediately ? 'Approved Answer' : 'New Comment';
      const notifications = Array.from(usersToNotify).map(userId => ({
        user_id: userId,
        request_id: requestId,
        deal_id: request?.deal_id || null,
        type: notificationType,
        title: notificationTitle,
        message: `${commenterName} ${approveImmediately ? 'approved an answer on' : 'commented on'} "${request?.title || 'a request'}"`
      }));
      
      if (notifications.length > 0) {
        await supabase.from('diligence_notifications').insert(notifications);
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-comments', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['diligence-request-counts'] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications-unread-count'] });
      toast.success(variables.approveImmediately ? 'Approved answer posted' : 'Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error(error);
    }
  });
};

export const useApproveComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ commentId, requestId }: { commentId: string; requestId: string }) => {
      const { data, error } = await supabase
        .from('diligence_comments')
        .update({
          comment_type: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, requestId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-comments', result.requestId] });
      toast.success('Comment approved as answer');
    },
    onError: (error) => {
      toast.error('Failed to approve comment');
      console.error(error);
    }
  });
};

export const useUnapproveComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, requestId }: { commentId: string; requestId: string }) => {
      const { data, error } = await supabase
        .from('diligence_comments')
        .update({
          comment_type: 'internal',
          approved_by: null,
          approved_at: null
        })
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, requestId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-comments', result.requestId] });
      toast.success('Answer unapproved');
    },
    onError: (error) => {
      toast.error('Failed to unapprove comment');
      console.error(error);
    }
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, content, requestId }: { commentId: string; content: string; requestId: string }) => {
      const { data, error } = await supabase
        .from('diligence_comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, requestId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-comments', result.requestId] });
      toast.success('Comment updated');
    },
    onError: (error) => {
      toast.error('Failed to update comment');
      console.error(error);
    }
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, requestId }: { commentId: string; requestId: string }) => {
      const { error } = await supabase
        .from('diligence_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      return { requestId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-comments', result.requestId] });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete comment');
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
