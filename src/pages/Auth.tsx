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

const Auth = () => {
  const navigate = useNavigate();
  const { loading, handleGoogleSignIn, handleSignIn, handleSignUp } = useAuthHandlers();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  const redirectToAppropriateRoute = async (userId: string) => {
    try {
      // Get user profile with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, role')
        .eq('user_id', userId)
        .single();
      
      if (!profile?.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      // Route based on user role
      const dashboardRoute = profile.role ? getDashboardRoute(profile.role) : getFallbackDashboardRoute();
      navigate(dashboardRoute);
    } catch (error) {
      console.error('Error determining user route:', error);
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