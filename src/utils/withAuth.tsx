import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getDashboardRoute, getFallbackDashboardRoute } from '@/lib/auth-utils';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

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
      const { toast } = useToast();

      if (authLoading || profileLoading) {
        return (
          <div className="min-h-screen bg-[#1C2526] flex items-center justify-center">
            <div className="text-[#FAFAFA]">Loading...</div>
          </div>
        );
      }

      if (!user) {
        console.log('[withAuth] No user, redirecting to auth');
        return <Navigate to="/auth" replace />;
      }

      const userRole = profile?.role;
      console.log('[withAuth] Checking access:', { userRole, requiredRole, skipOnboardingCheck: options.skipOnboardingCheck });

      // SUPER ADMIN BYPASS: Super admin and admin users have full access to EVERYTHING
      // This check must come first to prevent any redirects
      if (userRole === 'super_admin' || userRole === 'admin') {
        console.log('[withAuth] Super admin/admin access granted');
        return <Component {...props} />;
      }

      // INVESTOR ROLE RESTRICTIONS
      if (userRole === 'viewer') {
        // Check onboarding completion (unless explicitly skipped for onboarding page)
        if (!options.skipOnboardingCheck && !profile?.onboarding_completed) {
          console.log('[withAuth] Investor onboarding not completed, redirecting');
          return <Navigate to="/investor/onboarding" replace />;
        }

        // If accessing onboarding page but already completed, redirect to portal
        if (options.skipOnboardingCheck && profile?.onboarding_completed) {
          console.log('[withAuth] Onboarding already completed, redirecting to portal');
          return <Navigate to="/investor-portal" replace />;
        }

        // CRITICAL: Investors can ONLY access investor routes
        if (requiredRole && requiredRole !== 'investor') {
          console.log('[withAuth] Investor denied access to broker area:', requiredRole);
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this area. Redirecting to investor portal.",
            variant: "destructive",
          });
          return <Navigate to="/investor-portal" replace />;
        }
      }

      // EDITOR (STAFF) ACCESS
      if (userRole === 'editor') {
        // Editors can access staff routes and investor routes (for testing)
        if (requiredRole === 'admin') {
          console.log('[withAuth] Editor denied admin-only access');
          toast({
            title: "Admin Access Required",
            description: "This area requires administrator privileges.",
            variant: "destructive",
          });
          return <Navigate to="/dashboard" replace />;
        }
      }

      // Final role check
      if (requiredRole) {
        let hasAccess = false;
        
        switch (requiredRole) {
          case 'admin':
            hasAccess = false; // Only admin/super_admin, handled above
            break;
          case 'staff':
            hasAccess = userRole === 'editor';
            break;
          case 'investor':
            hasAccess = userRole === 'editor' || userRole === 'viewer';
            break;
        }

        if (!hasAccess) {
          console.log('[withAuth] Access denied, redirecting based on role');
          const redirectRoute = userRole ? getDashboardRoute(userRole) : getFallbackDashboardRoute();
          return <Navigate to={redirectRoute} replace />;
        }
      }

      console.log('[withAuth] Access granted');
      return <Component {...props} />;
    };
  };
};