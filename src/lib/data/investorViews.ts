
import { supabase } from '@/integrations/supabase/client';

export interface CompanyWithCustomFields {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  summary?: string;
  stage?: string;
  priority?: string;
  fit_score?: number;
  owner_id?: string;
  revenue?: string;
  ebitda?: string;
  asking_price?: string;
  highlights?: any;
  risks?: any;
  created_at: string;
  updated_at: string;
  custom_fields: Record<string, any>;
}

export interface CompanyWithGrowth {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  summary?: string;
  stage?: string;
  priority?: string;
  fit_score?: number;
  owner_id?: string;
  revenue?: string;
  ebitda?: string;
  asking_price?: string;
  highlights?: any;
  risks?: any;
  created_at: string;
  updated_at: string;
  growth_opportunities: Array<{
    id: string;
    title: string;
    description?: string;
    tags: string[];
    note?: string;
  }>;
}

// Get companies with resolved custom fields (investor-safe view)
export const getCompaniesWithCustomFields = async (): Promise<CompanyWithCustomFields[]> => {
  const { data, error } = await supabase
    .from('company_with_custom')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

// Get companies with resolved growth opportunities (investor-safe view)
export const getCompaniesWithGrowth = async (): Promise<CompanyWithGrowth[]> => {
  const { data, error } = await supabase
    .from('company_with_growth')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

// Get single company with all resolved data (uses the secure RPC function)
export const getInvestorCompanyData = async (companyId: string): Promise<{
  company: CompanyWithCustomFields;
  growth_opportunities: CompanyWithGrowth['growth_opportunities'];
} | null> => {
  const { data, error } = await supabase
    .rpc('get_investor_company_data', { company_uuid: companyId });

  if (error) throw error;
  return data;
};

// Get single company with custom fields
export const getCompanyWithCustomFields = async (companyId: string): Promise<CompanyWithCustomFields | null> => {
  const { data, error } = await supabase
    .from('company_with_custom')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Get single company with growth opportunities
export const getCompanyWithGrowth = async (companyId: string): Promise<CompanyWithGrowth | null> => {
  const { data, error } = await supabase
    .from('company_with_growth')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
