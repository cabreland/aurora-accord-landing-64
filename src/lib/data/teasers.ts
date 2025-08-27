import { supabase } from '@/integrations/supabase/client';

export interface TeaserData {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  summary?: string;
  revenue?: string;
  ebitda?: string;
  asking_price?: string;
  stage?: string;
  priority?: string;
  fit_score?: number;
  is_published: boolean;
  publish_at?: string;
  teaser_payload?: any;
  created_at: string;
  updated_at: string;
}

// Get published teasers for investor view using secure companies table access
export const getPublishedTeasers = async (query?: string): Promise<TeaserData[]> => {
  try {
    let queryBuilder = supabase
      .from('companies')
      .select(`
        id,
        name,
        industry,
        location,
        summary,
        revenue,
        ebitda,
        asking_price,
        stage,
        priority,
        fit_score,
        is_published,
        publish_at,
        teaser_payload,
        created_at,
        updated_at
      `)
      .eq('is_draft', false)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // Add published date filter
    queryBuilder = queryBuilder.or('publish_at.is.null,publish_at.lte.' + new Date().toISOString());

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,industry.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching teasers:', error);
      return [];
    }

    return (data || []).map(company => ({
      id: company.id,
      name: company.name,
      industry: company.industry,
      location: company.location,
      summary: company.summary,
      revenue: company.revenue,
      ebitda: company.ebitda,
      asking_price: company.asking_price,
      stage: company.stage,
      priority: company.priority,
      fit_score: company.fit_score,
      is_published: company.is_published,
      publish_at: company.publish_at,
      teaser_payload: company.teaser_payload,
      created_at: company.created_at,
      updated_at: company.updated_at
    }));
  } catch (error) {
    console.error('Error fetching teasers:', error);
    return [];
  }
};