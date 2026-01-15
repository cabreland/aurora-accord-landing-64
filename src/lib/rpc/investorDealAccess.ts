import { supabase } from '@/integrations/supabase/client';
import { DealData } from '@/lib/data/deals';

export type AccessType = 'single' | 'multiple' | 'custom' | 'portfolio';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// Partner permissions from partner_deal_access table
export interface PartnerPermissions {
  partner_role: string;
  can_view_data_room: boolean;
  can_upload_documents: boolean;
  can_edit_deal_info: boolean;
  can_answer_dd_questions: boolean;
  can_view_buyer_activity: boolean;
  can_message_buyers: boolean;
  can_approve_data_room: boolean;
  can_manage_users: boolean;
  revenue_share_percent?: number;
  access_from?: string;
  access_until?: string;
}

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
  priority?: string;
  // Partner access info
  partnerAccess?: PartnerPermissions;
}

/**
 * Get partner's permissions based on their user_id from partner_deal_access
 * Returns null for non-partner users
 */
export const getPartnerPermissions = async (userId: string): Promise<{ dealIds: string[]; permissions: Map<string, PartnerPermissions> } | null> => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('partner_deal_access')
      .select(`
        deal_id,
        partner_role,
        can_view_data_room,
        can_upload_documents,
        can_edit_deal_info,
        can_answer_dd_questions,
        can_view_buyer_activity,
        can_message_buyers,
        can_approve_data_room,
        can_manage_users,
        revenue_share_percent,
        access_from,
        access_until
      `)
      .eq('partner_id', userId)
      .or(`access_until.is.null,access_until.gte.${now}`)
      .order('granted_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.log('[getPartnerPermissions] No partner access found for user:', userId);
      return null;
    }

    const dealIds = data.map(access => access.deal_id);
    const permissions = new Map<string, PartnerPermissions>();
    
    data.forEach(access => {
      permissions.set(access.deal_id, {
        partner_role: access.partner_role,
        can_view_data_room: access.can_view_data_room ?? true,
        can_upload_documents: access.can_upload_documents ?? false,
        can_edit_deal_info: access.can_edit_deal_info ?? false,
        can_answer_dd_questions: access.can_answer_dd_questions ?? false,
        can_view_buyer_activity: access.can_view_buyer_activity ?? false,
        can_message_buyers: access.can_message_buyers ?? false,
        can_approve_data_room: access.can_approve_data_room ?? false,
        can_manage_users: access.can_manage_users ?? false,
        revenue_share_percent: access.revenue_share_percent ?? undefined,
        access_from: access.access_from ?? undefined,
        access_until: access.access_until ?? undefined,
      });
    });

    return { dealIds, permissions };
  } catch (error) {
    console.error('[getPartnerPermissions] Error fetching partner permissions:', error);
    return null;
  }
};

/**
 * Get investor's permissions based on their email and accepted invitations
 * Returns null for non-investor users (admins, staff)
 */
export const getInvestorPermissions = async (email: string): Promise<InvestorPermissions | null> => {
  try {
    // First check if user is admin/staff - they don't need investor permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .single();

    if (profile?.role && ['super_admin', 'admin', 'editor'].includes(profile.role)) {
      console.log('[getInvestorPermissions] Admin/staff user, skipping investor permissions check');
      return null;
    }

    const { data, error } = await supabase
      .from('investor_invitations')
      .select('access_type, deal_ids, portfolio_access, master_nda_signed, status')
      .eq('email', email)
      .eq('status', 'accepted')
      .single();

    if (error || !data) {
      console.warn('[getInvestorPermissions] No valid investor permissions found for:', email);
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
    console.error('[getInvestorPermissions] Error fetching investor permissions:', error);
    return null;
  }
};

/**
 * Get deals accessible to partner/investor based on their permissions
 * Priority: partner_deal_access > investor_invitations > fallback
 */
export const getAccessibleDeals = async (email: string, userId?: string): Promise<AccessibleDeal[]> => {
  try {
    // Check if user is admin/staff - they get all deals
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, user_id')
      .eq('email', email)
      .single();

    const effectiveUserId = userId || profile?.user_id;

    if (profile?.role && ['super_admin', 'admin', 'editor'].includes(profile.role)) {
      console.log('[getAccessibleDeals] Admin/staff user, returning all deals');
      
      const { data: deals, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('[getAccessibleDeals] Error fetching deals:', error);
        return [];
      }

      return (deals || []).map(deal => ({
        ...deal,
        access_granted: true,
        nda_required: false,
        nda_accepted: true,
        priority: deal.priority || 'medium'
      }));
    }

    // Priority 1: Check partner_deal_access first (new granular permissions)
    if (effectiveUserId) {
      const partnerAccess = await getPartnerPermissions(effectiveUserId);
      
      if (partnerAccess && partnerAccess.dealIds.length > 0) {
        console.log('[getAccessibleDeals] Partner user, fetching assigned deals:', partnerAccess.dealIds.length);
        
        const { data: deals, error } = await supabase
          .from('deals')
          .select('*')
          .in('id', partnerAccess.dealIds)
          .eq('status', 'active');

        if (error) {
          console.error('[getAccessibleDeals] Error fetching partner deals:', error);
          return [];
        }

        // Check NDA status and attach partner permissions
        const accessibleDeals: AccessibleDeal[] = await Promise.all(
          (deals || []).map(async (deal) => {
            const ndaAccepted = await checkNDAStatus(email, deal.company_id);
            const permissions = partnerAccess.permissions.get(deal.id);
            
            return {
              ...deal,
              access_granted: true,
              nda_required: true,
              nda_accepted: ndaAccepted,
              priority: deal.priority || 'medium',
              partnerAccess: permissions
            };
          })
        );

        return accessibleDeals;
      }
    }

    // Priority 2: Fall back to investor_invitations (legacy system)
    const permissions = await getInvestorPermissions(email);
    
    if (!permissions) {
      console.warn('[getAccessibleDeals] No permissions found, returning empty deals array');
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
      console.error('[getAccessibleDeals] Error fetching accessible deals:', error);
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
    console.error('[getAccessibleDeals] Error in getAccessibleDeals:', error);
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
export const calculateInvestorMetrics = async (email: string, userId?: string) => {
  const deals = await getAccessibleDeals(email, userId);
  
  const totalRevenue = deals.reduce((sum, deal) => {
    const revenue = parseFloat(deal.revenue?.replace(/[^0-9.]/g, '') || '0');
    return sum + revenue;
  }, 0);

  const activeDeals = deals.filter(deal => deal.status === 'active').length;
  
  const highPriorityDeals = deals.filter(deal => deal.priority === 'high').length;
  
  const ndaSignedDeals = deals.filter(deal => deal.nda_accepted).length;

  // Count deals with partner permissions
  const partnerDeals = deals.filter(deal => deal.partnerAccess).length;

  return {
    totalPipeline: `$${(totalRevenue / 1000000).toFixed(1)}M`,
    activeDeals: activeDeals,
    highPriorityDeals: highPriorityDeals,
    ndaSignedDeals: ndaSignedDeals,
    accessibleDealsCount: deals.length,
    partnerDeals: partnerDeals
  };
};

/**
 * Check if partner/investor can access specific deal
 */
export const canAccessDeal = async (email: string, dealId: string, userId?: string): Promise<boolean> => {
  try {
    // Priority 1: Check partner_deal_access
    if (userId) {
      const now = new Date().toISOString();
      const { data: partnerAccess } = await supabase
        .from('partner_deal_access')
        .select('id')
        .eq('partner_id', userId)
        .eq('deal_id', dealId)
        .or(`access_until.is.null,access_until.gte.${now}`)
        .single();

      if (partnerAccess) {
        return true;
      }
    }

    // Priority 2: Fall back to investor_invitations
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
 * Get partner's permissions for a specific deal
 */
export const getPartnerDealPermissions = async (userId: string, dealId: string): Promise<PartnerPermissions | null> => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('partner_deal_access')
      .select(`
        partner_role,
        can_view_data_room,
        can_upload_documents,
        can_edit_deal_info,
        can_answer_dd_questions,
        can_view_buyer_activity,
        can_message_buyers,
        can_approve_data_room,
        can_manage_users,
        revenue_share_percent,
        access_from,
        access_until
      `)
      .eq('partner_id', userId)
      .eq('deal_id', dealId)
      .or(`access_until.is.null,access_until.gte.${now}`)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      partner_role: data.partner_role,
      can_view_data_room: data.can_view_data_room ?? true,
      can_upload_documents: data.can_upload_documents ?? false,
      can_edit_deal_info: data.can_edit_deal_info ?? false,
      can_answer_dd_questions: data.can_answer_dd_questions ?? false,
      can_view_buyer_activity: data.can_view_buyer_activity ?? false,
      can_message_buyers: data.can_message_buyers ?? false,
      can_approve_data_room: data.can_approve_data_room ?? false,
      can_manage_users: data.can_manage_users ?? false,
      revenue_share_percent: data.revenue_share_percent ?? undefined,
      access_from: data.access_from ?? undefined,
      access_until: data.access_until ?? undefined,
    };
  } catch (error) {
    console.error('[getPartnerDealPermissions] Error:', error);
    return null;
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

    // Update last_accessed_at in partner_deal_access if applicable
    if (dealId) {
      await supabase
        .from('partner_deal_access')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('partner_id', profile.user_id)
        .eq('deal_id', dealId);
    }

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
