import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrength } from '@/components/ui/password-strength';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

interface SignUpFormProps {
  onSubmit: (email: string, password: string, firstName: string, lastName: string) => void;
  loading: boolean;
}

export const SignUpForm = ({ onSubmit, loading }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, firstName, lastName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-white/70">
            First name
          </Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-white/70">
            Last name
          </Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
            placeholder="Smith"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-medium text-white/70">
          Work email
        </Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
          placeholder="you@company.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-sm font-medium text-white/70">
          Password
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 pr-10 transition-all"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrength password={password} className="mt-2" />
        <p className="text-xs text-white/40 mt-1">
          Min 8 characters with uppercase, lowercase, numbers & symbols
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#E5C04A] hover:to-[#D4AF37] text-[#0A0C10] font-semibold shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 group"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Create account
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </Button>
    </form>
  );
};
