import { supabase } from '@/integrations/supabase/client';

/**
 * Unified deal routing utilities
 * Handles navigation between companies and deals
 */

export interface DealRouteInfo {
  dealId: string | null;
  companyId: string | null;
  companyName: string | null;
}

/**
 * Given a company ID, find the associated deal ID
 */
export const getDealIdFromCompanyId = async (companyId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching deal by company ID:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in getDealIdFromCompanyId:', error);
    return null;
  }
};

/**
 * Given a deal ID, find the associated company ID
 */
export const getCompanyIdFromDealId = async (dealId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('company_id')
      .eq('id', dealId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching company by deal ID:', error);
      return null;
    }

    return data?.company_id || null;
  } catch (error) {
    console.error('Error in getCompanyIdFromDealId:', error);
    return null;
  }
};

/**
 * Resolve any ID (company or deal) to complete route information
 * This is the main function to use for navigation
 */
export const resolveDealRoute = async (id: string): Promise<DealRouteInfo> => {
  try {
    // First, try as a deal ID
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select('id, company_id, company_name')
      .eq('id', id)
      .maybeSingle();

    if (!dealError && dealData) {
      return {
        dealId: dealData.id,
        companyId: dealData.company_id,
        companyName: dealData.company_name
      };
    }

    // If not found as deal, try as company ID
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();

    if (!companyError && companyData) {
      // Find associated deal
      const dealId = await getDealIdFromCompanyId(companyData.id);
      return {
        dealId: dealId,
        companyId: companyData.id,
        companyName: companyData.name
      };
    }

    // Not found
    return {
      dealId: null,
      companyId: null,
      companyName: null
    };
  } catch (error) {
    console.error('Error in resolveDealRoute:', error);
    return {
      dealId: null,
      companyId: null,
      companyName: null
    };
  }
};

/**
 * Get the correct deal detail route for any ID (company or deal)
 * Returns the route path to navigate to
 */
export const getDealDetailRoute = async (id: string): Promise<string> => {
  const info = await resolveDealRoute(id);
  
  // Prefer deal ID if available, otherwise use company ID
  const routeId = info.dealId || info.companyId || id;
  return `/deal/${routeId}`;
};
