
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getDashboardRoute, getFallbackDashboardRoute } from '@/lib/auth-utils';

export type RequiredRole = 'admin' | 'staff' | 'investor';

export const withAuth = (requiredRole?: RequiredRole) => {
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

      if (requiredRole) {
        const userRole = profile?.role;
        
        // ADMIN BYPASS: Admin users have full access to everything for development/testing
        if (userRole === 'admin') {
          return <Component {...props} />;
        }
        
        let hasAccess = false;
        
        switch (requiredRole) {
          case 'admin':
            hasAccess = false; // Only admin can access, already handled by bypass above
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
