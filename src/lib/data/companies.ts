
import { supabase } from '@/integrations/supabase/client';

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
  extended_data?: any;

  // Extended company details
  detailed_description?: string;
  founded_year?: string;
  team_size?: string;
  reason_for_sale?: string;
  growth_opportunities?: string[];
  founders_message?: string;
  founder_name?: string;
  ideal_buyer_profile?: string;
  rollup_potential?: string;
  market_trends?: string;
  profit_margin?: string;
  customer_count?: string;
  recurring_revenue?: string;
  cac_ltv_ratio?: string;
  placeholder_documents?: Array<{
    name: string;
    type: string;
    size: string;
    lastUpdated: string;
  }>;
}

export const upsertCompanyDraft = async (data: Partial<CompanyData>, id?: string): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Filter out empty string values for enums
    const cleanData = { ...data };
    if ((cleanData.stage as any) === '') delete cleanData.stage;
    if ((cleanData.priority as any) === '') delete cleanData.priority;

    const companyData = {
      name: cleanData.name || 'Untitled Company',
      industry: cleanData.industry,
      location: cleanData.location,
      summary: cleanData.summary,
      stage: cleanData.stage,
      priority: cleanData.priority,
      fit_score: cleanData.fit_score,
      owner_id: cleanData.owner_id || user.id,
      revenue: cleanData.revenue,
      ebitda: cleanData.ebitda,
      asking_price: cleanData.asking_price,
      passcode: cleanData.passcode,
      is_draft: true,
      highlights: JSON.stringify(cleanData.highlights || []),
      risks: JSON.stringify(cleanData.risks || []),
      // Extended fields stored as JSONB
      extended_data: JSON.stringify({
        detailed_description: cleanData.detailed_description,
        founded_year: cleanData.founded_year,
        team_size: cleanData.team_size,
        reason_for_sale: cleanData.reason_for_sale,
        growth_opportunities: cleanData.growth_opportunities || [],
        founders_message: cleanData.founders_message,
        founder_name: cleanData.founder_name,
        ideal_buyer_profile: cleanData.ideal_buyer_profile,
        rollup_potential: cleanData.rollup_potential,
        market_trends: cleanData.market_trends,
        profit_margin: cleanData.profit_margin,
        customer_count: cleanData.customer_count,
        recurring_revenue: cleanData.recurring_revenue,
        cac_ltv_ratio: cleanData.cac_ltv_ratio,
        placeholder_documents: cleanData.placeholder_documents || []
      })
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
    // Filter out empty string values for enums
    const cleanData = { ...data };
    if ((cleanData.stage as any) === '') delete cleanData.stage;
    if ((cleanData.priority as any) === '') delete cleanData.priority;

    const companyData = {
      name: cleanData.name || 'Untitled Company',
      industry: cleanData.industry,
      location: cleanData.location,
      summary: cleanData.summary,
      stage: cleanData.stage,
      priority: cleanData.priority,
      fit_score: cleanData.fit_score,
      owner_id: cleanData.owner_id,
      revenue: cleanData.revenue,
      ebitda: cleanData.ebitda,
      asking_price: cleanData.asking_price,
      passcode: cleanData.passcode,
      is_draft: false,
      highlights: JSON.stringify(cleanData.highlights || []),
      risks: JSON.stringify(cleanData.risks || []),
      // Extended fields stored as JSONB
      extended_data: JSON.stringify({
        detailed_description: cleanData.detailed_description,
        founded_year: cleanData.founded_year,
        team_size: cleanData.team_size,
        reason_for_sale: cleanData.reason_for_sale,
        growth_opportunities: cleanData.growth_opportunities || [],
        founders_message: cleanData.founders_message,
        founder_name: cleanData.founder_name,
        ideal_buyer_profile: cleanData.ideal_buyer_profile,
        rollup_potential: cleanData.rollup_potential,
        market_trends: cleanData.market_trends,
        profit_margin: cleanData.profit_margin,
        customer_count: cleanData.customer_count,
        recurring_revenue: cleanData.recurring_revenue,
        cac_ltv_ratio: cleanData.cac_ltv_ratio,
        placeholder_documents: cleanData.placeholder_documents || []
      })
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

    // Parse extended data safely
    const extendedData = (data as any).extended_data ? JSON.parse((data as any).extended_data) : {};

    return {
      ...data,
      highlights: typeof data.highlights === 'string' ? JSON.parse(data.highlights) : data.highlights || [],
      risks: typeof data.risks === 'string' ? JSON.parse(data.risks) : data.risks || [],
      ...extendedData
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

    return data.map(company => {
      const extendedData = (company as any).extended_data ? JSON.parse((company as any).extended_data) : {};
      return {
        ...company,
        highlights: typeof company.highlights === 'string' ? JSON.parse(company.highlights) : company.highlights || [],
        risks: typeof company.risks === 'string' ? JSON.parse(company.risks) : company.risks || [],
        ...extendedData
      };
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

// Convert company data to deal format for investor view
export const convertCompanyToDeal = (company: CompanyData) => {
  const extendedData = (company as any).extended_data ? JSON.parse((company as any).extended_data) : {};
  
  return {
    id: company.id || '',
    companyName: company.name || 'Unnamed Company',
    industry: company.industry || 'Not specified',
    revenue: company.revenue || 'Not disclosed',
    ebitda: company.ebitda || 'Not disclosed',
    stage: mapStageToDisplay(company.stage),
    progress: calculateProgress(company.stage),
    priority: capitalizeFirst(company.priority || 'medium'),
    location: company.location || 'Not specified',
    fitScore: company.fit_score || 50,
    lastUpdated: formatDate(company.updated_at),
    description: extendedData.detailed_description || company.summary || 'No description available',
    // Extended fields
    foundedYear: extendedData.founded_year || 'Not specified',
    teamSize: extendedData.team_size || 'Not specified',
    reasonForSale: extendedData.reason_for_sale || 'Not specified',
    growthOpportunities: extendedData.growth_opportunities || [],
    foundersMessage: extendedData.founders_message || '',
    founderName: extendedData.founder_name || 'Not specified',
    idealBuyerProfile: extendedData.ideal_buyer_profile || '',
    rollupPotential: extendedData.rollup_potential || '',
    marketTrends: extendedData.market_trends || '',
    profitMargin: extendedData.profit_margin || 'Not disclosed',
    customerCount: extendedData.customer_count || 'Not disclosed',
    recurringRevenue: extendedData.recurring_revenue || 'Not disclosed',
    cacLtvRatio: extendedData.cac_ltv_ratio || 'Not disclosed',
    highlights: company.highlights || [],
    risks: company.risks || [],
    documents: extendedData.placeholder_documents || []
  };
};

const mapStageToDisplay = (stage?: string) => {
  switch (stage) {
    case 'teaser': return 'Initial Review';
    case 'discovery': return 'NDA Signed';
    case 'dd': return 'Due Diligence';
    case 'closing': return 'Closing';
    default: return 'Initial Review';
  }
};

const calculateProgress = (stage?: string) => {
  switch (stage) {
    case 'teaser': return 25;
    case 'discovery': return 50;
    case 'dd': return 75;
    case 'closing': return 90;
    default: return 25;
  }
};

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
};
