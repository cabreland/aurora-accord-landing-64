import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getDashboardRoute, getFallbackDashboardRoute } from '@/lib/auth-utils';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
export type RequiredRole = 'admin' | 'staff' | 'investor';

interface WithAuthOptions {
  skipOnboardingCheck?: boolean;
}

export const withAuth = (requiredRole?: RequiredRole, options: WithAuthOptions = {}) => {
  return function AuthWrapper(Component: React.ComponentType<any>) {
    return function WrappedComponent(props: any) {
      const { user, loading: authLoading } = useAuth();
      const { profile, loading: profileLoading } = useUserProfile();

      if (authLoading || profileLoading) {
        return (
          <div className="min-h-screen bg-[#1C2526] flex items-center justify-center">
            <div className="text-[#FAFAFA]">Loading...</div>
          </div>
        );
      }

      if (!user) {
        return <Navigate to="/auth" replace />;
      }

      const userRole = profile?.role;

      // SUPER ADMIN BYPASS: Super admin and admin users have full access to EVERYTHING
      // This check must come first to prevent any redirects
      if (userRole === 'super_admin' || userRole === 'admin') {
        console.log('[withAuth] Super admin/admin access granted');
        return <Component {...props} />;
      }

      // Check onboarding completion for investors (unless explicitly skipped)
      if (!options.skipOnboardingCheck && userRole === 'viewer' && !profile?.onboarding_completed) {
        console.log('[withAuth] Investor onboarding not completed, redirecting');
        return <Navigate to="/investor/onboarding" replace />;
      }

      // If accessing onboarding page but already completed, redirect to portal
      if (options.skipOnboardingCheck && profile?.onboarding_completed && userRole === 'viewer') {
        console.log('[withAuth] Onboarding already completed, redirecting to portal');
        return <Navigate to="/investor-portal" replace />;
      }

      if (requiredRole) {
        
        let hasAccess = false;
        
        switch (requiredRole) {
          case 'admin':
            hasAccess = false; // Only admin/super_admin can access, already handled by bypass above
            break;
          case 'staff':
            hasAccess = userRole === 'editor';
            break;
          case 'investor':
            hasAccess = userRole === 'editor' || userRole === 'viewer';
            break;
        }

        if (!hasAccess) {
          // Redirect to appropriate dashboard based on user role
          const redirectRoute = userRole ? getDashboardRoute(userRole) : getFallbackDashboardRoute();
          return <Navigate to={redirectRoute} replace />;
        }
      }

      return <Component {...props} />;
    };
  };
};