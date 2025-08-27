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

// Get published teasers for investor view
export const getPublishedTeasers = async (query?: string): Promise<TeaserData[]> => {
  try {
    let queryBuilder = supabase
      .from('public_company_teasers')
      .select('*')
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching teasers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching teasers:', error);
    return [];
  }
};