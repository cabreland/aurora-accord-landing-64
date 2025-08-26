
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
  // Query companies that are not drafts
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('is_draft', false)
    .order('name');

  if (companiesError) throw companiesError;
  if (!companies) return [];

  // Get custom field values for these companies
  const companyIds = companies.map(c => c.id);
  if (companyIds.length === 0) return companies.map(c => ({ ...c, custom_fields: {} }));

  const { data: customValues, error: valuesError } = await supabase
    .from('company_custom_values')
    .select(`
      company_id,
      value,
      company_custom_fields!inner(key, type, is_active)
    `)
    .in('company_id', companyIds)
    .eq('company_custom_fields.is_active', true);

  if (valuesError) throw valuesError;

  // Build the result with custom fields resolved
  return companies.map(company => {
    const customFields: Record<string, any> = {};
    
    const companyCustomValues = customValues?.filter(cv => cv.company_id === company.id) || [];
    
    companyCustomValues.forEach(cv => {
      if (cv.company_custom_fields?.key) {
        const fieldType = cv.company_custom_fields.type;
        let resolvedValue = cv.value;
        
        // Type conversion based on field type
        if (fieldType === 'boolean' && typeof resolvedValue === 'string') {
          resolvedValue = resolvedValue === 'true';
        } else if ((fieldType === 'number' || fieldType === 'currency') && typeof resolvedValue === 'string') {
          resolvedValue = parseFloat(resolvedValue);
        }
        
        customFields[cv.company_custom_fields.key] = resolvedValue;
      }
    });

    return {
      ...company,
      custom_fields: customFields
    };
  });
};

// Get companies with resolved growth opportunities (investor-safe view)
export const getCompaniesWithGrowth = async (): Promise<CompanyWithGrowth[]> => {
  // Query companies that are not drafts
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('is_draft', false)
    .order('name');

  if (companiesError) throw companiesError;
  if (!companies) return [];

  // Get growth opportunities for these companies
  const companyIds = companies.map(c => c.id);
  if (companyIds.length === 0) return companies.map(c => ({ ...c, growth_opportunities: [] }));

  const { data: growthData, error: growthError } = await supabase
    .from('company_growth_opps')
    .select(`
      company_id,
      note,
      growth_opportunities!inner(id, title, description, tags, is_active)
    `)
    .in('company_id', companyIds)
    .eq('growth_opportunities.is_active', true);

  if (growthError) throw growthError;

  // Build the result with growth opportunities resolved
  return companies.map(company => {
    const companyGrowthData = growthData?.filter(gd => gd.company_id === company.id) || [];
    
    const growth_opportunities = companyGrowthData.map(gd => ({
      id: gd.growth_opportunities.id,
      title: gd.growth_opportunities.title,
      description: gd.growth_opportunities.description,
      tags: gd.growth_opportunities.tags,
      note: gd.note
    }));

    return {
      ...company,
      growth_opportunities
    };
  });
};

// Get single company with all resolved data
export const getInvestorCompanyData = async (companyId: string): Promise<{
  company: CompanyWithCustomFields;
  growth_opportunities: CompanyWithGrowth['growth_opportunities'];
} | null> => {
  // Get company data with custom fields
  const companiesWithCustom = await getCompaniesWithCustomFields();
  const company = companiesWithCustom.find(c => c.id === companyId);
  
  if (!company) return null;

  // Get growth opportunities for this company
  const companiesWithGrowth = await getCompaniesWithGrowth();
  const companyWithGrowth = companiesWithGrowth.find(c => c.id === companyId);
  
  return {
    company,
    growth_opportunities: companyWithGrowth?.growth_opportunities || []
  };
};

// Get single company with custom fields
export const getCompanyWithCustomFields = async (companyId: string): Promise<CompanyWithCustomFields | null> => {
  const companies = await getCompaniesWithCustomFields();
  return companies.find(c => c.id === companyId) || null;
};

// Get single company with growth opportunities
export const getCompanyWithGrowth = async (companyId: string): Promise<CompanyWithGrowth | null> => {
  const companies = await getCompaniesWithGrowth();
  return companies.find(c => c.id === companyId) || null;
};
