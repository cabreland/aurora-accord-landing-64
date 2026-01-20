import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type FinancingStage = 
  | 'pre_qualification'
  | 'application_submitted'
  | 'under_review'
  | 'additional_docs_requested'
  | 'conditional_approval'
  | 'final_approval'
  | 'closing'
  | 'funded'
  | 'declined'
  | 'withdrawn';

export type FinancingType = 
  | 'sba_7a'
  | 'sba_504'
  | 'conventional'
  | 'seller_financing'
  | 'mezzanine'
  | 'equity'
  | 'bridge'
  | 'line_of_credit'
  | 'other';

export interface Lender {
  id: string;
  name: string;
  type: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  notes: string | null;
  avg_close_days: number | null;
  success_rate: number | null;
  is_preferred: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancingApplication {
  id: string;
  deal_id: string;
  lender_id: string | null;
  application_number: string | null;
  financing_type: FinancingType;
  stage: FinancingStage;
  loan_amount: number | null;
  interest_rate: number | null;
  term_months: number | null;
  amortization_months: number | null;
  down_payment_percent: number | null;
  submitted_at: string | null;
  approved_at: string | null;
  closing_date: string | null;
  funded_at: string | null;
  assigned_to: string | null;
  partner_id: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  health_score: number;
  days_in_stage: number;
  stage_entered_at: string;
  internal_notes: string | null;
  decline_reason: string | null;
  is_primary: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  lender?: Lender;
  deal?: {
    id: string;
    company_name: string;
    asking_price: string | null;
    status: string;
  };
}

export interface FinancingDocument {
  id: string;
  application_id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: 'required' | 'requested' | 'received' | 'under_review' | 'approved' | 'rejected' | 'waived';
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  requested_at: string;
  due_date: string | null;
  received_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancingCondition {
  id: string;
  application_id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'waived' | 'rejected';
  due_date: string | null;
  completed_at: string | null;
  completed_by: string | null;
  assigned_to: string | null;
  notes: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface FinancingActivity {
  id: string;
  application_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  document_id: string | null;
  condition_id: string | null;
  metadata: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
}

// Fetch all lenders
export const useLenders = () => {
  return useQuery({
    queryKey: ['lenders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lenders')
        .select('*')
        .eq('is_active', true)
        .order('is_preferred', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as Lender[];
    }
  });
};

// Fetch all financing applications with joins
export const useFinancingApplications = (filters?: {
  dealId?: string;
  lenderId?: string;
  stage?: FinancingStage;
  assignedTo?: string;
}) => {
  return useQuery({
    queryKey: ['financing-applications', filters],
    queryFn: async () => {
      let query = supabase
        .from('financing_applications')
        .select(`
          *,
          lender:lenders(*),
          deal:deals(id, company_name, asking_price, status)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.dealId) {
        query = query.eq('deal_id', filters.dealId);
      }
      if (filters?.lenderId) {
        query = query.eq('lender_id', filters.lenderId);
      }
      if (filters?.stage) {
        query = query.eq('stage', filters.stage);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as FinancingApplication[];
    }
  });
};

// Fetch single application with all related data
export const useFinancingApplication = (applicationId: string) => {
  return useQuery({
    queryKey: ['financing-application', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financing_applications')
        .select(`
          *,
          lender:lenders(*),
          deal:deals(id, company_name, asking_price, status, industry, location)
        `)
        .eq('id', applicationId)
        .single();
      
      if (error) throw error;
      return data as FinancingApplication;
    },
    enabled: !!applicationId
  });
};

// Fetch documents for an application
export const useFinancingDocuments = (applicationId: string) => {
  return useQuery({
    queryKey: ['financing-documents', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financing_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('category')
        .order('created_at');
      
      if (error) throw error;
      return data as FinancingDocument[];
    },
    enabled: !!applicationId
  });
};

// Fetch conditions for an application
export const useFinancingConditions = (applicationId: string) => {
  return useQuery({
    queryKey: ['financing-conditions', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financing_conditions')
        .select('*')
        .eq('application_id', applicationId)
        .order('order_index')
        .order('created_at');
      
      if (error) throw error;
      return data as FinancingCondition[];
    },
    enabled: !!applicationId
  });
};

// Fetch activity for an application
export const useFinancingActivity = (applicationId: string) => {
  return useQuery({
    queryKey: ['financing-activity', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financing_activity')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as FinancingActivity[];
    },
    enabled: !!applicationId
  });
};

// Create new application
export const useCreateFinancingApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: Partial<FinancingApplication> & { deal_id: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('financing_applications')
        .insert({
          ...data,
          created_by: user.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await supabase.from('financing_activity').insert({
        application_id: result.id,
        activity_type: 'application_created',
        title: 'Application created',
        description: `New ${data.financing_type || 'conventional'} financing application`,
        user_id: user.user.id
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing-applications'] });
      toast({ title: 'Application created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create application', description: error.message, variant: 'destructive' });
    }
  });
};

// Update application
export const useUpdateFinancingApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FinancingApplication> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('financing_applications')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financing-applications'] });
      queryClient.invalidateQueries({ queryKey: ['financing-application', variables.id] });
      toast({ title: 'Application updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update application', description: error.message, variant: 'destructive' });
    }
  });
};

// Stage labels for display
export const FINANCING_STAGE_LABELS: Record<FinancingStage, string> = {
  pre_qualification: 'Pre-Qualification',
  application_submitted: 'Application Submitted',
  under_review: 'Under Review',
  additional_docs_requested: 'Docs Requested',
  conditional_approval: 'Conditional Approval',
  final_approval: 'Final Approval',
  closing: 'Closing',
  funded: 'Funded',
  declined: 'Declined',
  withdrawn: 'Withdrawn'
};

export const FINANCING_TYPE_LABELS: Record<FinancingType, string> = {
  sba_7a: 'SBA 7(a)',
  sba_504: 'SBA 504',
  conventional: 'Conventional',
  seller_financing: 'Seller Financing',
  mezzanine: 'Mezzanine',
  equity: 'Equity',
  bridge: 'Bridge Loan',
  line_of_credit: 'Line of Credit',
  other: 'Other'
};

// Stage colors
export const FINANCING_STAGE_COLORS: Record<FinancingStage, string> = {
  pre_qualification: 'bg-slate-500',
  application_submitted: 'bg-blue-500',
  under_review: 'bg-yellow-500',
  additional_docs_requested: 'bg-orange-500',
  conditional_approval: 'bg-purple-500',
  final_approval: 'bg-emerald-500',
  closing: 'bg-cyan-500',
  funded: 'bg-green-600',
  declined: 'bg-red-500',
  withdrawn: 'bg-gray-400'
};
