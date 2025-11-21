import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { getDashboardRoute, getFallbackDashboardRoute } from '@/lib/auth-utils';
import { DeveloperBadge } from '@/components/investor/DeveloperBadge';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { loading, handleGoogleSignIn, handleSignIn, handleSignUp } = useAuthHandlers();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  
  const handleDevLogin = () => {
    // Use your actual super admin account email
    // You'll need to set the password or sign up first if you haven't
    handleSignIn('cabreland@gmail.com', 'admin123');
  };

  const redirectToAppropriateRoute = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_completed, onboarding_skipped')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        console.error('[Auth] No profile found for user');
        return;
      }

      console.log('[Auth] Profile loaded:', { 
        role: profile.role, 
        onboardingCompleted: profile.onboarding_completed,
        onboardingSkipped: profile.onboarding_skipped 
      });

      // Investors (viewers) must complete OR skip onboarding first
      const hasCompletedOrSkippedOnboarding = profile.onboarding_completed || profile.onboarding_skipped;
      
      if (profile.role === 'viewer' && !hasCompletedOrSkippedOnboarding) {
        console.log('[Auth] Redirecting to investor onboarding');
        navigate('/investor/onboarding');
        return;
      }

      // Route based on role
      if (profile.role === 'viewer') {
        console.log('[Auth] Redirecting to investor portal');
        navigate('/investor-portal');
      } else {
        const route = getDashboardRoute(profile.role);
        console.log('[Auth] Redirecting to:', route);
        navigate(route);
      }
    } catch (error) {
      console.error('[Auth] Error redirecting user:', error);
      navigate(getFallbackDashboardRoute());
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !onboardingLoading) {
        await redirectToAppropriateRoute(session.user.id);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !onboardingLoading) {
        await redirectToAppropriateRoute(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onboardingLoading]);

  return (
    <div className="min-h-screen bg-[#1C2526] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0A0F0F] border-[#D4AF37]/30">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-[#FAFAFA]">
            EBB Data Room
          </CardTitle>
          <CardDescription className="text-[#F4E4BC]">
            Access your investment portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dev Mode Quick Login */}
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <DeveloperBadge />
              <span className="text-xs text-blue-400">Quick Access</span>
            </div>
            <Button
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Shield className="mr-2 h-4 w-4" />
              Login as Super Admin
            </Button>
            <div className="text-xs text-blue-300/70 space-y-1">
              <p>Email: cabreland@gmail.com</p>
              <p className="text-amber-400">⚠️ Set password to "admin123" or update code with your actual password</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-[#D4AF37]/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#0A0F0F] px-3 text-[#F4E4BC]/70">or continue with</span>
            </div>
          </div>
          {/* Google OAuth Button */}
          <GoogleAuthButton onClick={handleGoogleSignIn} loading={loading} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-[#D4AF37]/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#0A0F0F] px-3 text-[#F4E4BC]/70">or</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1A1F2E] border border-[#D4AF37]/20">
              <TabsTrigger 
                value="signin"
                className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-6">
              <SignInForm onSubmit={handleSignIn} loading={loading} />
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <SignUpForm onSubmit={handleSignUp} loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-[#F4E4BC]/70">
            Secure access to investment opportunities
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;