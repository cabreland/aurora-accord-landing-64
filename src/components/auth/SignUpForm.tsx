import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrength } from '@/components/ui/password-strength';

interface SignUpFormProps {
  onSubmit: (email: string, password: string, firstName: string, lastName: string) => void;
  loading: boolean;
}

export const SignUpForm = ({ onSubmit, loading }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, firstName, lastName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );
};