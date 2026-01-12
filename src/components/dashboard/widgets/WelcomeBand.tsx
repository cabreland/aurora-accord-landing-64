import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

export const WelcomeBand = () => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const { getDisplayName } = useUserProfile();

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] border border-[#D4AF37]/20 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
          <span className="text-lg">👋</span>
        </div>
        <div>
          <p className="text-[#FAFAFA] font-medium">
            Welcome back, {getDisplayName() || 'Team Member'}
          </p>
          <p className="text-[#F4E4BC]/60 text-sm">
            Here's what needs your attention today.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          onClick={() => navigate('/deals')}
          className="bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#B8962E] font-medium"
        >
          View My Deals
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <button 
          onClick={() => setDismissed(true)}
          className="p-2 text-[#F4E4BC]/60 hover:text-[#FAFAFA] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
