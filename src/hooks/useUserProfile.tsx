import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Prevent duplicate requests
    if (profile && profile.user_id === user.id) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setError(error.message);
          return;
        }

        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]); // Use user.id instead of user object to prevent unnecessary re-renders

  const getDisplayName = () => {
    if (!profile) return user?.email || 'User';
    
    const { first_name, last_name } = profile;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    if (first_name) return first_name;
    if (last_name) return last_name;
    return profile.email;
  };

  const getRoleDisplayName = () => {
    if (!profile) return 'User';
    
    switch (profile.role) {
      case 'super_admin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      case 'editor':
        return 'Manager';
      case 'viewer':
        return 'Investor';
      default:
        return 'User';
    }
  };

  return {
    profile,
    loading,
    error,
    getDisplayName,
    getRoleDisplayName,
    hasRole: (role: UserRole) => profile?.role === role,
    isAdmin: () => profile?.role === 'super_admin' || profile?.role === 'admin',
    isEditor: () => profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.role === 'editor',
    canManageUsers: () => profile?.role === 'super_admin' || profile?.role === 'admin',
    canCreateDeals: () => profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.role === 'editor',
  };
};