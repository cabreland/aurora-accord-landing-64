import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getPasswordStrength } from '@/lib/security';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export const PasswordStrength = ({ password, className }: PasswordStrengthProps) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const strengthConfig = {
    weak: { value: 25, color: 'bg-red-500', text: 'Weak' },
    medium: { value: 65, color: 'bg-yellow-500', text: 'Medium' },
    strong: { value: 100, color: 'bg-green-500', text: 'Strong' }
  };

  const config = strengthConfig[strength];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-[#F4E4BC]">Password Strength:</span>
        <span className={`text-sm font-medium ${
          strength === 'weak' ? 'text-red-400' : 
          strength === 'medium' ? 'text-yellow-400' : 
          'text-green-400'
        }`}>
          {config.text}
        </span>
      </div>
      <Progress 
        value={config.value} 
        className="h-2"
      />
    </div>
  );
};