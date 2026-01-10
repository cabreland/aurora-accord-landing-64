import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeamInvitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_name: string | null;
  role: string;
  personal_message: string | null;
  invitation_token: string;
  deal_id: string | null;
  permissions: Record<string, boolean>;
  expires_at: string;
  accepted_at: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  created_at: string;
  updated_at: string;
  // Joined data
  inviter?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  deal?: {
    title: string;
    company_name: string;
  };
}

export interface SendInvitationParams {
  invitee_email: string;
  invitee_name?: string;
  role: string;
  personal_message?: string;
  deal_id?: string;
  permissions?: Record<string, boolean>;
}

/**
 * Fetch all team invitations
 */
export const useTeamInvitations = (status?: 'pending' | 'accepted' | 'expired' | 'revoked') => {
  return useQuery({
    queryKey: ['team-invitations', status],
    queryFn: async (): Promise<TeamInvitation[]> => {
      let query = supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch inviter profiles in parallel
      const inviterIds = [...new Set((data || []).map(inv => inv.inviter_id))];
      const dealIds = [...new Set((data || []).filter(inv => inv.deal_id).map(inv => inv.deal_id))];
      
      const [profilesResult, dealsResult] = await Promise.all([
        inviterIds.length > 0 
          ? supabase.from('profiles').select('user_id, first_name, last_name, email').in('user_id', inviterIds)
          : { data: [] },
        dealIds.length > 0
          ? supabase.from('deals').select('id, title, company_name').in('id', dealIds)
          : { data: [] }
      ]);
      
      const profilesMap = new Map((profilesResult.data || []).map(p => [p.user_id, p]));
      const dealsMap = new Map((dealsResult.data || []).map(d => [d.id, d]));
      
      return (data || []).map(inv => ({
        ...inv,
        inviter: profilesMap.get(inv.inviter_id),
        deal: inv.deal_id ? dealsMap.get(inv.deal_id) : undefined,
      })) as TeamInvitation[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get invitation stats
 */
export const useInvitationStats = () => {
  return useQuery({
    queryKey: ['invitation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(i => i.status === 'pending').length || 0,
        accepted: data?.filter(i => i.status === 'accepted').length || 0,
        expired: data?.filter(i => i.status === 'expired').length || 0,
        revoked: data?.filter(i => i.status === 'revoked').length || 0,
      };
      
      return stats;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Send a team invitation
 */
export const useSendTeamInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: SendInvitationParams) => {
      const { data, error } = await supabase.functions.invoke('send-team-invitation', {
        body: params
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['invitation-stats'] });
      toast.success(
        data.is_existing_user 
          ? 'Invitation sent! They can sign in to accept.'
          : 'Invitation sent! They will receive an email to create their account.'
      );
    },
    onError: (error: Error) => {
      console.error('Failed to send invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    },
  });
};

/**
 * Revoke an invitation
 */
export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['invitation-stats'] });
      toast.success('Invitation revoked');
    },
    onError: (error: Error) => {
      toast.error('Failed to revoke invitation');
    },
  });
};

/**
 * Resend an invitation
 */
export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitation: TeamInvitation) => {
      // First delete the old invitation
      await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitation.id);
      
      // Then send a new one
      const { data, error } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          invitee_email: invitation.invitee_email,
          invitee_name: invitation.invitee_name,
          role: invitation.role,
          personal_message: invitation.personal_message,
          deal_id: invitation.deal_id,
          permissions: invitation.permissions,
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['invitation-stats'] });
      toast.success('Invitation resent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation');
    },
  });
};

/**
 * Get team member stats (combines profiles with invitations)
 */
export const useTeamStats = () => {
  return useQuery({
    queryKey: ['team-stats'],
    queryFn: async () => {
      const [profilesResult, invitationsResult] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at').in('role', ['admin', 'super_admin', 'editor', 'viewer']),
        supabase.from('team_invitations').select('status'),
      ]);
      
      const profiles = profilesResult.data || [];
      const invitations = invitationsResult.data || [];
      
      return {
        totalMembers: profiles.length,
        activeMembers: profiles.length, // All fetched members are considered active
        pendingInvites: invitations.filter(i => i.status === 'pending').length,
        admins: profiles.filter(p => p.role === 'admin' || p.role === 'super_admin').length,
        editors: profiles.filter(p => p.role === 'editor').length,
        viewers: profiles.filter(p => p.role === 'viewer').length,
      };
    },
    staleTime: 60 * 1000,
  });
};