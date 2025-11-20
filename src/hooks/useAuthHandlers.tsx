import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validatePassword, sanitizeInput, sanitizeEmail, checkRateLimit, logSecurityEvent, getSafeErrorMessage } from '@/lib/security';
import { getDashboardRoute, getFallbackDashboardRoute } from '@/lib/auth-utils';

export const useAuthHandlers = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkExistingUser = async (email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();
    
    return data !== null;
  };

  // Helper to get appropriate redirect URL based on current user or fallback
  const getRedirectUrl = async (): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        const route = profile?.role ? getDashboardRoute(profile.role) : getFallbackDashboardRoute();
        return `${window.location.origin}${route}`;
      }
    } catch (error) {
      console.error('Error getting redirect URL:', error);
    }
    
    return `${window.location.origin}${getFallbackDashboardRoute()}`;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    const redirectTo = await getRedirectUrl();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });

    if (error) {
      logSecurityEvent('oauth_signin_failed', {
        provider: 'google',
        error: error.message
      });
      
      toast({
        title: "Sign in failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    } else {
      logSecurityEvent('oauth_signin_initiated', {
        provider: 'google'
      });
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);

    // Rate limiting check
    const rateLimitKey = `signin_${sanitizeEmail(email)}`;
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      toast({
        title: "Too many attempts",
        description: "Please wait 15 minutes before trying again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const cleanEmail = sanitizeEmail(email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      logSecurityEvent('signin_failed', {
        email: cleanEmail,
        error: error.message
      });
      
      toast({
        title: "Sign in failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } else {
      logSecurityEvent('signin_success', {
        email: cleanEmail
      });
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    setLoading(true);

    // Sanitize inputs first
    const cleanEmail = sanitizeEmail(email);
    const cleanFirstName = sanitizeInput(firstName, 50);
    const cleanLastName = sanitizeInput(lastName, 50);

    // Check if user already exists
    const userExists = await checkExistingUser(cleanEmail);
    if (userExists) {
      console.log('[Signup] Account already exists:', cleanEmail);
      toast({
        title: "Account already exists",
        description: "An account with this email already exists. Please sign in instead.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log('[Signup] Password validation failed');
      toast({
        title: "Password must be at least 8 characters",
        description: passwordValidation.errors.join('\n'),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Rate limiting check
    const rateLimitKey = `signup_${cleanEmail}`;
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      console.log('[Signup] Rate limit exceeded:', cleanEmail);
      toast({
        title: "Too many attempts",
        description: "Please wait 1 hour before trying again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const redirectUrl = `${window.location.origin}/investor/onboarding`;

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
          role: 'viewer' // Public signup always creates investor/viewer role
        }
      }
    });

    if (error) {
      console.error('[Signup] Signup failed:', error.message);
      logSecurityEvent('signup_failed', {
        email: cleanEmail,
        error: error.message
      });
      
      toast({
        title: "Sign up failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } else if (data.user) {
      console.log('[Signup] User created:', data.user.id, 'Session:', data.session ? 'Active' : 'Pending confirmation');
      logSecurityEvent('signup_success', {
        email: cleanEmail,
        userId: data.user.id,
        role: 'viewer'
      });
      
      // Check if we have an active session (email confirmation disabled)
      if (data.session) {
        console.log('[Signup] Active session - redirecting to onboarding');
        toast({
          title: "Welcome! Complete your profile to access deals.",
          description: "Redirecting to onboarding...",
        });
        
        // Navigate to onboarding after short delay
        setTimeout(() => {
          navigate('/investor/onboarding');
        }, 1500);
      } else {
        // No session - email confirmation required
        console.log('[Signup] Email confirmation required');
        toast({
          title: "Account created successfully!",
          description: "Please check your email to confirm your account before signing in.",
          duration: 8000,
        });
      }
    }

    setLoading(false);
  };

  return {
    loading,
    handleGoogleSignIn,
    handleSignIn,
    handleSignUp
  };
};