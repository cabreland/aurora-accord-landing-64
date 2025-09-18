import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Determines the appropriate dashboard route based on user role
 */
export const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
    case 'admin':
    case 'editor':
      return '/dashboard';
    case 'viewer':
    default:
      return '/investor-portal';
  }
};

/**
 * Determines if a user role has admin privileges
 */
export const isAdminRole = (role: UserRole): boolean => {
  return role === 'super_admin' || role === 'admin';
};

/**
 * Determines if a user role has staff privileges
 */
export const isStaffRole = (role: UserRole): boolean => {
  return role === 'super_admin' || role === 'admin' || role === 'editor';
};

/**
 * Determines if a user role can manage other users
 */
export const canManageUsers = (role: UserRole): boolean => {
  return role === 'super_admin' || role === 'admin';
};

/**
 * Gets a fallback dashboard route when user role is unknown
 */
export const getFallbackDashboardRoute = (): string => {
  return '/investor-portal';
};