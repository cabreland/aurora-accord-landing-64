import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { getDashboardRoute, getFallbackDashboardRoute } from '@/lib/auth-utils';
import { ArrowRight, Shield, Building2, TrendingUp, Lock, Users } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { loading, handleGoogleSignIn, handleSignIn, handleSignUp } = useAuthHandlers();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

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

      const hasCompletedOrSkippedOnboarding = profile.onboarding_completed || profile.onboarding_skipped;
      
      if (profile.role === 'viewer' && !hasCompletedOrSkippedOnboarding) {
        navigate('/investor/onboarding');
        return;
      }

      if (profile.role === 'viewer') {
        navigate('/investor-portal');
      } else {
        const route = getDashboardRoute(profile.role);
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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !onboardingLoading) {
        await redirectToAppropriateRoute(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onboardingLoading]);

  const features = [
    { icon: Building2, title: 'Deal Management', description: 'Streamlined M&A workflow' },
    { icon: Lock, title: 'Secure Data Rooms', description: 'Bank-grade encryption' },
    { icon: TrendingUp, title: 'Due Diligence', description: 'Comprehensive tracking' },
    { icon: Users, title: 'Investor Relations', description: 'Centralized communication' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0C10]">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0C10] via-[#111318] to-[#0A0C10]" />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#0A0C10]" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">EBB Data Room</span>
          </motion.div>

          {/* Hero Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                The modern platform for{' '}
                <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
                  M&A excellence
                </span>
              </h1>
              <p className="text-lg text-white/60 max-w-md leading-relaxed">
                Streamline your deal flow, manage due diligence, and close transactions with confidence.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                >
                  <feature.icon className="w-5 h-5 text-[#D4AF37] mb-3" />
                  <h3 className="text-sm font-medium text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-white/50">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center gap-6 text-sm text-white/40"
          >
            <span>© 2024 EBB Partners</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#0D1117]">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex items-center justify-center gap-3 mb-10"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#0A0C10]" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">EBB Data Room</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-white/50 text-sm">
                {activeTab === 'signin' 
                  ? 'Sign in to access your investment portal' 
                  : 'Get started with your secure data room'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'signin'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Google Auth */}
            <GoogleAuthButton onClick={handleGoogleSignIn} loading={loading} />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-white/40 bg-[#0D1117]">or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'signin' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'signin' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'signin' ? (
                  <SignInForm onSubmit={handleSignIn} loading={loading} />
                ) : (
                  <SignUpForm onSubmit={handleSignUp} loading={loading} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer Links */}
            <p className="text-center text-xs text-white/40">
              By continuing, you agree to our{' '}
              <a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
