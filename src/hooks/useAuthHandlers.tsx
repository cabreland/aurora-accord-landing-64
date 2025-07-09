import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validatePassword, sanitizeInput, sanitizeEmail, checkRateLimit, logSecurityEvent, getSafeErrorMessage } from '@/lib/security';

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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/investor-portal`
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
      toast({
        title: "Password too weak",
        description: passwordValidation.errors.join('\n'),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Rate limiting check
    const rateLimitKey = `signup_${cleanEmail}`;
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      toast({
        title: "Too many attempts",
        description: "Please wait 1 hour before trying again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const redirectUrl = `${window.location.origin}/investor-portal`;

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
        }
      }
    });

    if (error) {
      logSecurityEvent('signup_failed', {
        email: cleanEmail,
        error: error.message
      });
      
      toast({
        title: "Sign up failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } else {
      logSecurityEvent('signup_success', {
        email: cleanEmail
      });
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
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