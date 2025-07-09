import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setError(error.message);
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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
    hasRole: (role: string) => profile?.role === role,
    isAdmin: () => profile?.role === 'admin',
    isEditor: () => profile?.role === 'editor' || profile?.role === 'admin',
    canManageUsers: () => profile?.role === 'admin',
    canCreateDeals: () => profile?.role === 'admin' || profile?.role === 'editor',
  };
};