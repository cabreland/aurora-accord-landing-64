import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to check if investor has completed onboarding
 * Redirects to onboarding page if not completed
 */
export const useOnboardingCheck = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;

      console.log('[OnboardingCheck] Checking onboarding status for user:', user.id);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('[OnboardingCheck] Error fetching profile:', error);
          return;
        }

        console.log('[OnboardingCheck] Profile data:', data);

        // IMPORTANT: Skip check for admins/super_admins (they can access any page for testing)
        if (data?.role === 'super_admin' || data?.role === 'admin') {
          console.log('[OnboardingCheck] Admin user - skipping onboarding check');
          return;
        }

        // Only apply to investors (viewer role)
        if (data?.role === 'viewer' && !data?.onboarding_completed) {
          const currentPath = location.pathname;
          
          // Don't redirect if already on onboarding page or auth pages
          if (currentPath !== '/investor/onboarding' && !currentPath.startsWith('/auth')) {
            console.log('[OnboardingCheck] Onboarding incomplete, redirecting from:', currentPath);
            navigate('/investor/onboarding');
          }
        }
      } catch (error) {
        console.error('[OnboardingCheck] Error:', error);
      }
    };

    checkOnboarding();
  }, [user, navigate, location.pathname]);
};
