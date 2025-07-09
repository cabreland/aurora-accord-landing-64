import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

const PortalHeader = () => {
  const { user, signOut } = useAuth();
  const { getDisplayName, getRoleDisplayName, loading } = useUserProfile();

  return (
    <div className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] p-8 rounded-2xl border border-[#D4AF37]/30">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#FAFAFA] mb-4">
            Data Room Portal
          </h1>
          <p className="text-xl text-[#F4E4BC] max-w-2xl">
            Comprehensive deal and document management platform
          </p>
          <p className="text-sm text-[#F4E4BC]/70 mt-2">
            Welcome back, {loading ? 'Loading...' : getDisplayName()}
          </p>
        </div>
        <div className="mt-6 lg:mt-0 flex items-center gap-4">
          <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] font-bold px-6 py-3 text-base">
            {loading ? 'Loading...' : getRoleDisplayName()}
          </Badge>
          <Button
            onClick={signOut}
            variant="outline"
            className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortalHeader;