
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompanyData {
  id?: string;
  name: string;
  industry?: string;
  location?: string;
  summary?: string;
  stage?: 'teaser' | 'discovery' | 'dd' | 'closing';
  priority?: 'low' | 'medium' | 'high';
  fit_score?: number;
  owner_id?: string;
  revenue?: string;
  ebitda?: string;
  asking_price?: string;
  highlights?: string[];
  risks?: string[];
  passcode?: string;
  is_draft?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const upsertCompanyDraft = async (data: Partial<CompanyData>, id?: string): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const companyData = {
      ...data,
      owner_id: data.owner_id || user.id,
      is_draft: true,
      highlights: JSON.stringify(data.highlights || []),
      risks: JSON.stringify(data.risks || []),
    };

    if (id) {
      // Update existing draft
      const { data: updatedCompany, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id)
        .select('id')
        .single();

      if (error) throw error;
      return updatedCompany.id;
    } else {
      // Create new draft
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select('id')
        .single();

      if (error) throw error;
      return newCompany.id;
    }
  } catch (error) {
    console.error('Error upserting company draft:', error);
    throw error;
  }
};

export const finalizeCompany = async (id: string, data: Partial<CompanyData>): Promise<string> => {
  try {
    const companyData = {
      ...data,
      is_draft: false,
      highlights: JSON.stringify(data.highlights || []),
      risks: JSON.stringify(data.risks || []),
    };

    const { data: finalizedCompany, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return finalizedCompany.id;
  } catch (error) {
    console.error('Error finalizing company:', error);
    throw error;
  }
};

export const getCompany = async (id: string): Promise<CompanyData | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      highlights: typeof data.highlights === 'string' ? JSON.parse(data.highlights) : data.highlights || [],
      risks: typeof data.risks === 'string' ? JSON.parse(data.risks) : data.risks || [],
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
};

export const getCompanies = async (query?: string): Promise<CompanyData[]> => {
  try {
    let queryBuilder = supabase
      .from('companies')
      .select('*')
      .eq('is_draft', false)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    return data.map(company => ({
      ...company,
      highlights: typeof company.highlights === 'string' ? JSON.parse(company.highlights) : company.highlights || [],
      risks: typeof company.risks === 'string' ? JSON.parse(company.risks) : company.risks || [],
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};
