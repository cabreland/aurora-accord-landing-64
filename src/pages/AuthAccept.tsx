import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getDashboardRoute, getFallbackDashboardRoute } from '@/lib/auth-utils';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const AuthAccept = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    const handleInviteAcceptance = async () => {
      try {
        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (error) {
          console.error('Error exchanging code:', error);
          toast({
            title: "Error",
            description: "Invalid or expired invitation link",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (data.user) {
          setUser(data.user);
          
          // Check if user needs to set password
          // In Supabase, users invited via admin API typically need to set password
          setNeedsPassword(true);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Error handling invite:', error);
        toast({
          title: "Error",
          description: "Failed to process invitation",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleInviteAcceptance();
  }, [navigate, toast]);

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      
      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        toast({
          title: "Error",
          description: "Failed to set password",
          variant: "destructive",
        });
        return;
      }

      // Update profile to mark onboarding as not completed (they'll need to go through onboarding)
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      toast({
        title: "Success",
        description: "Password set successfully! Welcome to the platform.",
      });

      // Redirect to onboarding
      navigate('/onboarding');
    } catch (error: any) {
      console.error('Error setting password:', error);
      toast({
        title: "Error",
        description: "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Processing invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">EB</span>
          </div>
          <CardTitle className="text-2xl">Welcome to Exclusive Business Brokers</CardTitle>
          <CardDescription>
            Complete your account setup by creating a secure password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {needsPassword ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Setting Password...' : 'Set Password & Continue'}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Your account is ready!</p>
              <Button onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('role')
                      .eq('user_id', user.id)
                      .single();
                    
                    const route = profile?.role ? getDashboardRoute(profile.role) : getFallbackDashboardRoute();
                    navigate(route);
                  } else {
                    navigate(getFallbackDashboardRoute());
                  }
                } catch (error) {
                  console.error('Error determining route:', error);
                  navigate(getFallbackDashboardRoute());
                }
              }} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthAccept;