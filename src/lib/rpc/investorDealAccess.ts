import { supabase } from '@/integrations/supabase/client';
import { DealData } from '@/lib/data/deals';

export type AccessType = 'single' | 'multiple' | 'custom' | 'portfolio';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface InvestorPermissions {
  access_type: AccessType;
  deal_ids?: string[];
  portfolio_access: boolean;
  master_nda_signed: boolean;
  invitation_status: InvitationStatus;
}

export interface AccessibleDeal extends DealData {
  access_granted: boolean;
  nda_required: boolean;
  nda_accepted: boolean;
  invitation_id?: string;
  priority?: string; // Add priority field that's missing from DealData
}

/**
 * Get investor's permissions based on their email and accepted invitations
 */
export const getInvestorPermissions = async (email: string): Promise<InvestorPermissions | null> => {
  try {
    const { data, error } = await supabase
      .from('investor_invitations')
      .select('access_type, deal_ids, portfolio_access, master_nda_signed, status')
      .eq('email', email)
      .eq('status', 'accepted')
      .single();

    if (error || !data) {
      console.warn('No valid investor permissions found for:', email);
      return null;
    }

    return {
      access_type: data.access_type,
      deal_ids: data.deal_ids ? JSON.parse(JSON.stringify(data.deal_ids)) : [],
      portfolio_access: data.portfolio_access,
      master_nda_signed: data.master_nda_signed,
      invitation_status: data.status as InvitationStatus
    };
  } catch (error) {
    console.error('Error fetching investor permissions:', error);
    return null;
  }
};

/**
 * Get deals accessible to investor based on their permissions
 */
export const getAccessibleDeals = async (email: string): Promise<AccessibleDeal[]> => {
  try {
    const permissions = await getInvestorPermissions(email);
    
    if (!permissions) {
      console.warn('No permissions found, returning empty deals array');
      return [];
    }

    let dealQuery = supabase
      .from('deals')
      .select('*')
      .eq('status', 'active');

    // Apply access filtering based on permission type
    if (permissions.access_type === 'single') {
      // Single deal access - filter by specific deal_id from invitation
      const { data: invitation } = await supabase
        .from('investor_invitations')
        .select('deal_id')
        .eq('email', email)
        .eq('status', 'accepted')
        .single();
      
      if (invitation?.deal_id) {
        dealQuery = dealQuery.eq('id', invitation.deal_id);
      } else {
        return [];
      }
    } else if (permissions.access_type === 'multiple' || permissions.access_type === 'custom') {
      // Multiple deals access - filter by deal_ids array
      if (permissions.deal_ids && permissions.deal_ids.length > 0) {
        dealQuery = dealQuery.in('id', permissions.deal_ids);
      } else {
        return [];
      }
    }
    // For portfolio access, return all active deals (no additional filtering)

    const { data: deals, error } = await dealQuery;

    if (error) {
      console.error('Error fetching accessible deals:', error);
      return [];
    }

    // Check NDA status for each deal
    const accessibleDeals: AccessibleDeal[] = await Promise.all(
      (deals || []).map(async (deal) => {
        const ndaAccepted = await checkNDAStatus(email, deal.company_id);
        
        return {
          ...deal,
          access_granted: true,
          nda_required: true, // Assume all deals require NDA
          nda_accepted: ndaAccepted,
          invitation_id: undefined, // Could be populated if needed
          priority: deal.priority || 'medium' // Add default priority
        };
      })
    );

    return accessibleDeals;
  } catch (error) {
    console.error('Error in getAccessibleDeals:', error);
    return [];
  }
};

/**
 * Check if investor has accepted NDA for a company
 */
export const checkNDAStatus = async (email: string, companyId?: string): Promise<boolean> => {
  if (!companyId) return false;

  try {
    // Get user ID from email
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (!profile?.user_id) return false;

    // Check NDA acceptance
    const { data } = await supabase
      .from('company_nda_acceptances')
      .select('id')
      .eq('user_id', profile.user_id)
      .eq('company_id', companyId)
      .single();

    return !!data;
  } catch (error) {
    console.error('Error checking NDA status:', error);
    return false;
  }
};

/**
 * Calculate personalized dashboard metrics based on accessible deals
 */
export const calculateInvestorMetrics = async (email: string) => {
  const deals = await getAccessibleDeals(email);
  
  const totalRevenue = deals.reduce((sum, deal) => {
    const revenue = parseFloat(deal.revenue?.replace(/[^0-9.]/g, '') || '0');
    return sum + revenue;
  }, 0);

  const activeDeals = deals.filter(deal => deal.status === 'active').length;
  
  const highPriorityDeals = deals.filter(deal => deal.priority === 'high').length;
  
  const ndaSignedDeals = deals.filter(deal => deal.nda_accepted).length;

  return {
    totalPipeline: `$${(totalRevenue / 1000000).toFixed(1)}M`,
    activeDeals: activeDeals,
    highPriorityDeals: highPriorityDeals,
    ndaSignedDeals: ndaSignedDeals,
    accessibleDealsCount: deals.length
  };
};

/**
 * Check if investor can access specific deal
 */
export const canAccessDeal = async (email: string, dealId: string): Promise<boolean> => {
  try {
    const permissions = await getInvestorPermissions(email);
    
    if (!permissions) return false;

    // Portfolio access grants access to all deals
    if (permissions.portfolio_access) return true;

    // Check single deal access
    if (permissions.access_type === 'single') {
      const { data: invitation } = await supabase
        .from('investor_invitations')
        .select('deal_id')
        .eq('email', email)
        .eq('status', 'accepted')
        .single();
      
      return invitation?.deal_id === dealId;
    }

    // Check multiple/custom deal access
    if (permissions.access_type === 'multiple' || permissions.access_type === 'custom') {
      return permissions.deal_ids?.includes(dealId) || false;
    }

    return false;
  } catch (error) {
    console.error('Error checking deal access:', error);
    return false;
  }
};

/**
 * Log investor activity for tracking and analytics
 */
export const logInvestorActivity = async (
  email: string, 
  action: string, 
  dealId?: string, 
  metadata?: any
) => {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (!profile?.user_id) return;

    // Log activity
    await supabase.rpc('log_user_activity', {
      p_action: action,
      p_resource_type: dealId ? 'deal' : null,
      p_resource_id: dealId || null,
      p_metadata: metadata || {}
    });
  } catch (error) {
    console.error('Error logging investor activity:', error);
  }
};