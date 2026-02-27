import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { validatePassword } from '@/lib/security';

type ResetStep = 'request' | 'confirm' | 'success';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<ResetStep>('request');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if we have a recovery token in the URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      setStep('confirm');
    }

    // Also listen for auth state changes (recovery event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('confirm');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setStep('success');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast({
        title: 'Password too weak',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated successfully!' });
      setTimeout(() => navigate('/auth'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#0A0C10]" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">EBB Data Room</span>
        </div>

        {step === 'request' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">Reset your password</h2>
              <p className="text-white/50 text-sm">
                Enter your email and we'll send you a reset link.
              </p>
            </div>
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white/70">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
                  placeholder="you@company.com"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#E5C04A] hover:to-[#D4AF37] text-[#0A0C10] font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send reset link <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </form>
            <p className="text-center text-sm">
              <button onClick={() => navigate('/auth')} className="text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors">
                Back to sign in
              </button>
            </p>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">Set new password</h2>
              <p className="text-white/50 text-sm">Enter your new password below.</p>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white/70">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#D4AF37]/50 pr-10"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/70">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#D4AF37]/50"
                  placeholder="Repeat password"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#E5C04A] hover:to-[#D4AF37] text-[#0A0C10] font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
              </Button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Check your email</h2>
            <p className="text-white/50 text-sm">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>. 
              Click the link in the email to set your new password.
            </p>
            <p className="text-white/40 text-xs">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              onClick={() => setStep('request')}
              className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            >
              Try again
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;