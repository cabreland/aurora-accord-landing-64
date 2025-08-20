
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

export type RequiredRole = 'admin' | 'staff' | 'investor';

export const withAuth = (requiredRole?: RequiredRole) => {
  return function AuthWrapper(Component: React.ComponentType<any>) {
    return function WrappedComponent(props: any) {
      const { user, loading: authLoading } = useAuth();
      const { profile, loading: profileLoading } = useUserProfile();

      if (authLoading || profileLoading) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-foreground">Loading...</div>
          </div>
        );
      }

      if (!user) {
        return <Navigate to="/auth" replace />;
      }

      if (requiredRole) {
        const userRole = profile?.role;
        const hasAccess = 
          requiredRole === 'admin' && userRole === 'admin' ||
          requiredRole === 'staff' && ['admin', 'editor'].includes(userRole || '') ||
          requiredRole === 'investor' && ['admin', 'editor', 'viewer'].includes(userRole || '');

        if (!hasAccess) {
          return <Navigate to="/investor-portal" replace />;
        }
      }

      return <Component {...props} />;
    };
  };
};
