import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeamGroup {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  members?: TeamGroupMember[];
}

export interface TeamGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string | null;
  permissions: Record<string, unknown>;
  user?: {
    user_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export const useTeamGroups = () => {
  return useQuery({
    queryKey: ['team-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_groups')
        .select(`
          id, name, description, created_by, created_at,
          members:team_group_members(id, group_id, user_id, role, permissions)
        `)
        .order('name');
      if (error) throw error;
      return (data || []) as unknown as TeamGroup[];
    },
  });
};

export const useCreateTeamGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('team_groups')
        .insert({ name, description: description || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-groups'] });
      toast.success('Team group created');
    },
    onError: () => toast.error('Failed to create team group'),
  });
};

export const useAddGroupToDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, dealId }: { groupId: string; dealId: string }) => {
      // Get all members of the group
      const { data: members, error: membersError } = await supabase
        .from('team_group_members')
        .select('user_id, role, permissions')
        .eq('group_id', groupId);
      if (membersError) throw membersError;

      if (!members || members.length === 0) return;

      // Get existing deal team members to avoid duplicates
      const { data: existing } = await supabase
        .from('deal_team_members')
        .select('user_id')
        .eq('deal_id', dealId);

      const existingUserIds = new Set((existing || []).map(m => m.user_id));

      const toInsert = members
        .filter(m => !existingUserIds.has(m.user_id))
        .map(m => ({
          deal_id: dealId,
          user_id: m.user_id,
          role: (m.role as any) || 'analyst',
          permissions: m.permissions || {},
        }));

      if (toInsert.length === 0) return;

      const { error } = await supabase.from('deal_team_members').insert(toInsert);
      if (error) throw error;
      return toInsert.length;
    },
    onSuccess: (count, { dealId }) => {
      queryClient.invalidateQueries({ queryKey: ['deal-team', dealId] });
      toast.success(count ? `Added ${count} team members from group` : 'All group members already on team');
    },
    onError: () => toast.error('Failed to add group members'),
  });
};
