import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignInFormProps {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
}

export const SignInForm = ({ onSubmit, loading }: SignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );
};