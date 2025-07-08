import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = `${window.location.origin}/investor-portal`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
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
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#FAFAFA]">
            EBB Data Room
          </CardTitle>
          <CardDescription className="text-[#F4E4BC]">
            Access your investment portal
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <Label htmlFor="email" className="text-[#F4E4BC]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#F4E4BC]">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#F4E4BC]">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#F4E4BC]">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-[#F4E4BC]">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-[#F4E4BC]">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
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