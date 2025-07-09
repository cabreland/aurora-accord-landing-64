import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrength } from '@/components/ui/password-strength';
import { validatePassword, sanitizeInput, sanitizeEmail, checkRateLimit, logSecurityEvent, getSafeErrorMessage } from '@/lib/security';
import { Mail } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/investor-portal');
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/investor-portal');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 font-medium py-3"
          >
            <Mail className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>

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
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#F4E4BC] font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37] h-11"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#F4E4BC] font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37] h-11"
                    placeholder="Enter your password"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold h-11"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#F4E4BC] font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37] h-11"
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#F4E4BC] font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37] h-11"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-[#F4E4BC] font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37] h-11"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-[#F4E4BC] font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37] h-11"
                    placeholder="Create a strong password"
                  />
                  <PasswordStrength password={password} className="mt-2" />
                  <div className="text-xs text-[#F4E4BC]/70 mt-1">
                    Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold h-11"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
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