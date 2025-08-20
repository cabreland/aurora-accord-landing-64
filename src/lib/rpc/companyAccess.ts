
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
  const { data, error } = await supabase.rpc('accept_company_nda' as any, {
    p_company_id: companyId
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as CompanyAccessRPCResponse;
};

/**
 * Submit access request for a company
 */
export const submitAccessRequest = async (
  companyId: string,
  requestedLevel: AccessLevel,
  reason?: string
): Promise<CompanyAccessRPCResponse> => {
  const { data, error } = await supabase.rpc('submit_access_request' as any, {
    p_company_id: companyId,
    p_requested_level: requestedLevel,
    p_reason: reason || null
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as CompanyAccessRPCResponse;
};

/**
 * Approve access request (Admin/Editor only)
 */
export const approveAccessRequest = async (
  requestId: string,
  approvedLevel?: AccessLevel
): Promise<CompanyAccessRPCResponse> => {
  const { data, error } = await supabase.rpc('approve_access_request' as any, {
    p_request_id: requestId,
    p_approved_level: approvedLevel || null
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as CompanyAccessRPCResponse;
};

/**
 * Deny access request (Admin/Editor only)
 */
export const denyAccessRequest = async (
  requestId: string,
  reason?: string
): Promise<CompanyAccessRPCResponse> => {
  const { data, error } = await supabase.rpc('deny_access_request' as any, {
    p_request_id: requestId,
    p_reason: reason || null
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as CompanyAccessRPCResponse;
};

/**
 * Check if user can view company confidential content
 */
export const canViewCompanyConfidential = async (
  userId: string,
  companyId: string,
  requiredLevel: AccessLevel
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('can_view_company_confidential' as any, {
    p_user_id: userId,
    p_company_id: companyId,
    p_required_level: requiredLevel
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
};

/**
 * Get user's access level for a company
 */
export const getUserCompanyAccessLevel = async (
  userId: string,
  companyId: string
): Promise<AccessLevel> => {
  const { data, error } = await supabase.rpc('user_company_access_level' as any, {
    p_user_id: userId,
    p_company_id: companyId
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data as AccessLevel) || 'public';
};

/**
 * Get investor company summary view using raw SQL query
 * Since the view isn't in the generated types yet, we'll query it directly
 */
export const getInvestorCompanySummary = async (): Promise<InvestorCompanySummary[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      industry,
      website,
      logo_url,
      status
    `)
    .eq('status', 'active');

  if (error) {
    throw new Error(error.message);
  }

  // Transform the data to match our expected interface
  const companies: InvestorCompanySummary[] = (data || []).map(company => ({
    company_id: company.id,
    company_name: company.name,
    industry: company.industry,
    website: company.website,
    logo_url: company.logo_url,
    company_status: company.status,
    effective_access_level: 'public' as AccessLevel // Default until we can query the view properly
  }));

  return companies;
};
