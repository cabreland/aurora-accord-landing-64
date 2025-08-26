
import { supabase } from '@/integrations/supabase/client';

export interface DealData {
  id?: string;
  title: string;
  company_name: string;
  company_id?: string;
  description?: string;
  industry?: string;
  revenue?: string;
  ebitda?: string;
  location?: string;
  status?: 'draft' | 'active' | 'archived';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const createDealFromCompany = async (companyId: string, dealTitle?: string): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get company data to populate deal fields
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    const dealData = {
      title: dealTitle || `${company.name} - Investment Opportunity`,
      company_name: company.name,
      company_id: companyId,
      description: company.summary,
      industry: company.industry,
      revenue: company.revenue,
      ebitda: company.ebitda,
      location: company.location,
      status: 'draft' as const,
      created_by: user.id
    };

    const { data: newDeal, error } = await supabase
      .from('deals')
      .insert(dealData)
      .select('id')
      .single();

    if (error) throw error;
    return newDeal.id;
  } catch (error) {
    console.error('Error creating deal from company:', error);
    throw error;
  }
};

export const getDealByCompanyId = async (companyId: string): Promise<DealData | null> => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    console.error('Error fetching deal by company ID:', error);
    return null;
  }
};

export const updateDeal = async (dealId: string, updates: Partial<DealData>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', dealId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating deal:', error);
    throw error;
  }
};
