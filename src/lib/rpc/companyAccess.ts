
import { supabase } from '@/integrations/supabase/client';

// Types matching our database enums and tables
export type AccessLevel = 'public' | 'teaser' | 'cim' | 'financials' | 'full';
export type RequestStatus = 'pending' | 'approved' | 'denied';

export interface CompanyAccessRPCResponse {
  success: boolean;
  message: string;
  request_id?: string;
  company_id?: string;
  requested_level?: AccessLevel;
  approved_level?: AccessLevel;
  nda_version?: string;
  reason?: string;
}

export interface InvestorCompanySummary {
  company_id: string;
  company_name: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  company_status: string;
  access_level?: AccessLevel;
  nda_accepted_at?: string;
  nda_version?: string;
  effective_access_level: AccessLevel;
}

/**
 * Accept NDA for a company
 */
export const acceptCompanyNDA = async (companyId: string): Promise<CompanyAccessRPCResponse> => {
  const { data, error } = await supabase.rpc('accept_company_nda', {
    p_company_id: companyId
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Submit access request for a company
 */
export const submitAccessRequest = async (
  companyId: string,
  requestedLevel: AccessLevel,
  reason?: string
): Promise<CompanyAccessRPCResponse> => {
  const { data, error } = await supabase.rpc('submit_access_request', {
    p_company_id: companyId,
    p_requested_level: requestedLevel,
    p_reason: reason || null
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Approve access request (Admin/Editor only)
 */
export const approveAccessRequest = async (
  requestId: string,
  approvedLevel?: AccessLevel
): Promise<CompanyAccessRPCResponse> => {
  const { data, error } = await supabase.rpc('approve_access_request', {
    p_request_id: requestId,
    p_approved_level: approvedLevel || null
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Deny access request (Admin/Editor only)
 */
export const denyAccessRequest = async (
  requestId: string,
  reason?: string
): Promise<CompanyAccessRPCResponse> => {
  const { data, error } = await supabase.rpc('deny_access_request', {
    p_request_id: requestId,
    p_reason: reason || null
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Check if user can view company confidential content
 */
export const canViewCompanyConfidential = async (
  userId: string,
  companyId: string,
  requiredLevel: AccessLevel
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('can_view_company_confidential', {
    p_user_id: userId,
    p_company_id: companyId,
    p_required_level: requiredLevel
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Get user's access level for a company
 */
export const getUserCompanyAccessLevel = async (
  userId: string,
  companyId: string
): Promise<AccessLevel> => {
  const { data, error } = await supabase.rpc('user_company_access_level', {
    p_user_id: userId,
    p_company_id: companyId
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Get investor company summary view
 */
export const getInvestorCompanySummary = async (): Promise<InvestorCompanySummary[]> => {
  const { data, error } = await supabase
    .from('investor_company_summary')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
