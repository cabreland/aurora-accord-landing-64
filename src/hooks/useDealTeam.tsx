import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type DealTeamRole =
  | 'deal_lead'
  | 'analyst'
  | 'external_reviewer'
  | 'investor'
  | 'seller'
  | 'advisor';

export interface TeamMemberPermissions {
  can_view_all_folders: boolean;
  can_upload_documents: boolean;
  can_delete_documents: boolean;
  can_create_requests: boolean;
  can_edit_requests: boolean;
  can_approve_documents: boolean;
  restricted_folders: string[];
}

export interface DealTeamMember {
  id: string;
  deal_id: string;
  user_id: string;
  role: DealTeamRole;
  permissions: TeamMemberPermissions;
  added_by: string | null;
  added_at: string;
  last_active: string | null;
  // Joined data
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  added_by_user?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const DEFAULT_PERMISSIONS: Record<DealTeamRole, TeamMemberPermissions> = {
  deal_lead: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: true,
    can_create_requests: true,
    can_edit_requests: true,
    can_approve_documents: true,
    restricted_folders: [],
  },
  analyst: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: false,
    can_create_requests: true,
    can_edit_requests: true,
    can_approve_documents: false,
    restricted_folders: [],
  },
  external_reviewer: {
    can_view_all_folders: false,
    can_upload_documents: false,
    can_delete_documents: false,
    can_create_requests: false,
    can_edit_requests: false,
    can_approve_documents: true,
    restricted_folders: [],
  },
  investor: {
    can_view_all_folders: false,
    can_upload_documents: false,
    can_delete_documents: false,
    can_create_requests: false,
    can_edit_requests: false,
    can_approve_documents: false,
    restricted_folders: [],
  },
  seller: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: false,
    can_create_requests: false,
    can_edit_requests: false,
    can_approve_documents: false,
    restricted_folders: [],
  },
  advisor: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: false,
    can_create_requests: true,
    can_edit_requests: true,
    can_approve_documents: false,
    restricted_folders: [],
  },
};

export const useDealTeam = (dealId: string | undefined) => {
  return useQuery({
    queryKey: ['deal-team', dealId],
    queryFn: async () => {
      if (!dealId) return [];

      const { data: members, error } = await supabase
        .from('deal_team_members')
        .select('*')
        .eq('deal_id', dealId)
        .order('added_at', { ascending: true });

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set([
        ...members.map(m => m.user_id),
        ...members.map(m => m.added_by).filter(Boolean),
      ])] as string[];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Enrich members with user data
      return members.map(member => ({
        ...member,
        role: member.role as DealTeamRole,
        permissions: member.permissions as unknown as TeamMemberPermissions,
        user: profileMap.get(member.user_id) || null,
        added_by_user: member.added_by ? profileMap.get(member.added_by) || null : null,
      })) as DealTeamMember[];
    },
    enabled: !!dealId,
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      userId,
      role,
      permissions,
    }: {
      dealId: string;
      userId: string;
      role: DealTeamRole;
      permissions?: Partial<TeamMemberPermissions>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const finalPermissions = {
        ...DEFAULT_PERMISSIONS[role],
        ...permissions,
      };

      const { data, error } = await supabase
        .from('deal_team_members')
        .insert({
          deal_id: dealId,
          user_id: userId,
          role,
          permissions: finalPermissions,
          added_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.rpc('log_deal_activity', {
        p_deal_id: dealId,
        p_activity_type: 'team_member_added',
        p_entity_type: 'team',
        p_entity_id: data.id,
        p_metadata: { member_id: userId, role },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-team', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-activities', variables.dealId] });
      toast.success('Team member added successfully');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.error('This user is already a team member');
      } else {
        toast.error('Failed to add team member');
      }
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      dealId,
      role,
      permissions,
    }: {
      memberId: string;
      dealId: string;
      role?: DealTeamRole;
      permissions?: Partial<TeamMemberPermissions>;
    }) => {
      const updates: Record<string, unknown> = {};
      if (role) updates.role = role;
      if (permissions) updates.permissions = permissions;

      const { data, error } = await supabase
        .from('deal_team_members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.rpc('log_deal_activity', {
        p_deal_id: dealId,
        p_activity_type: 'permission_changed',
        p_entity_type: 'team',
        p_entity_id: memberId,
        p_metadata: { role, permissions },
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deal-team', data.deal_id] });
      queryClient.invalidateQueries({ queryKey: ['deal-activities', data.deal_id] });
      toast.success('Team member updated');
    },
    onError: () => {
      toast.error('Failed to update team member');
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      dealId,
    }: {
      memberId: string;
      dealId: string;
    }) => {
      const { error } = await supabase
        .from('deal_team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Log activity
      await supabase.rpc('log_deal_activity', {
        p_deal_id: dealId,
        p_activity_type: 'team_member_removed',
        p_entity_type: 'team',
        p_entity_id: memberId,
        p_metadata: {},
      });

      return { memberId, dealId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-team', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-activities', variables.dealId] });
      toast.success('Team member removed');
    },
    onError: () => {
      toast.error('Failed to remove team member');
    },
  });
};

export const getRoleDisplayName = (role: DealTeamRole): string => {
  const names: Record<DealTeamRole, string> = {
    deal_lead: 'Deal Lead',
    analyst: 'Analyst',
    external_reviewer: 'External Reviewer',
    investor: 'Investor',
    seller: 'Seller',
    advisor: 'Advisor',
  };
  return names[role] || role;
};

export const getRoleColor = (role: DealTeamRole): string => {
  const colors: Record<DealTeamRole, string> = {
    deal_lead: 'bg-blue-100 text-blue-800',
    analyst: 'bg-green-100 text-green-800',
    external_reviewer: 'bg-purple-100 text-purple-800',
    investor: 'bg-amber-100 text-amber-800',
    seller: 'bg-orange-100 text-orange-800',
    advisor: 'bg-cyan-100 text-cyan-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};
