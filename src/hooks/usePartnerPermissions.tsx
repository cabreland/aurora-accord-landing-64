import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getPartnerDealPermissions } from '@/lib/rpc/investorDealAccess';
import { supabase } from '@/integrations/supabase/client';

export interface UserPermissions {
  // Basic access (always true for authorized users)
  canView: boolean;
  canDownload: boolean;
  
  // Partner-specific permissions
  canUploadDocuments: boolean;
  canEditDealInfo: boolean;
  canAnswerDDQuestions: boolean;
  canViewBuyerActivity: boolean;
  canMessageBuyers: boolean;
  canApproveDataRoom: boolean;
  canManageUsers: boolean;
  
  // Role info
  partnerRole?: string;
  isAdmin: boolean;
  isPartner: boolean;
  isLoading: boolean;
}

// Default permissions for non-partner users (view only)
const DEFAULT_PERMISSIONS: UserPermissions = {
  canView: true,
  canDownload: true,
  canUploadDocuments: false,
  canEditDealInfo: false,
  canAnswerDDQuestions: false,
  canViewBuyerActivity: false,
  canMessageBuyers: false,
  canApproveDataRoom: false,
  canManageUsers: false,
  isAdmin: false,
  isPartner: false,
  isLoading: false,
};

// Full permissions for admin users
const ADMIN_PERMISSIONS: UserPermissions = {
  canView: true,
  canDownload: true,
  canUploadDocuments: true,
  canEditDealInfo: true,
  canAnswerDDQuestions: true,
  canViewBuyerActivity: true,
  canMessageBuyers: true,
  canApproveDataRoom: true,
  canManageUsers: true,
  isAdmin: true,
  isPartner: false,
  isLoading: false,
};

/**
 * Hook to get user's permissions for a specific deal
 * Returns granular permissions based on partner_deal_access or role
 */
export const usePartnerPermissions = (dealId: string | undefined) => {
  const { user } = useAuth();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['partner-permissions', dealId, user?.id],
    queryFn: async (): Promise<UserPermissions> => {
      if (!user?.id || !dealId) {
        return { ...DEFAULT_PERMISSIONS, isLoading: false };
      }

      // Check if user is admin/editor (full access)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role && ['super_admin', 'admin', 'editor'].includes(profile.role)) {
        return ADMIN_PERMISSIONS;
      }

      // Check partner_deal_access for granular permissions
      const partnerPerms = await getPartnerDealPermissions(user.id, dealId);

      if (partnerPerms) {
        return {
          canView: partnerPerms.can_view_data_room,
          canDownload: true, // Partners can always download if they have view access
          canUploadDocuments: partnerPerms.can_upload_documents,
          canEditDealInfo: partnerPerms.can_edit_deal_info,
          canAnswerDDQuestions: partnerPerms.can_answer_dd_questions,
          canViewBuyerActivity: partnerPerms.can_view_buyer_activity,
          canMessageBuyers: partnerPerms.can_message_buyers,
          canApproveDataRoom: partnerPerms.can_approve_data_room,
          canManageUsers: partnerPerms.can_manage_users,
          partnerRole: partnerPerms.partner_role,
          isAdmin: false,
          isPartner: true,
          isLoading: false,
        };
      }

      // Default: view-only permissions for investors without partner access
      return DEFAULT_PERMISSIONS;
    },
    enabled: !!user?.id && !!dealId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    permissions: permissions || { ...DEFAULT_PERMISSIONS, isLoading: true },
    isLoading,
  };
};

/**
 * Simple hook to check a single permission
 */
export const useCanPerformAction = (
  dealId: string | undefined,
  action: keyof Omit<UserPermissions, 'partnerRole' | 'isAdmin' | 'isPartner' | 'isLoading'>
): boolean => {
  const { permissions, isLoading } = usePartnerPermissions(dealId);
  
  if (isLoading) return false;
  return permissions[action] ?? false;
};
