import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  profile_picture_url: string | null;
}

/**
 * Fetch team members (admin, staff, broker roles) for assignment dropdowns
 */
export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, email, first_name, last_name, role, profile_picture_url')
        .in('role', ['admin', 'super_admin', 'editor'])
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Get display name for a team member
 */
export const getTeamMemberName = (member: TeamMember | null | undefined): string => {
  if (!member) return 'Unassigned';
  
  const firstName = member.first_name?.trim();
  const lastName = member.last_name?.trim();
  
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  
  return member.email?.split('@')[0] || 'Unknown';
};

/**
 * Get initials for avatar
 */
export const getTeamMemberInitials = (member: TeamMember | null | undefined): string => {
  if (!member) return '?';
  
  const firstName = member.first_name?.trim();
  const lastName = member.last_name?.trim();
  
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (lastName) return lastName[0].toUpperCase();
  
  return member.email?.[0]?.toUpperCase() || '?';
};
