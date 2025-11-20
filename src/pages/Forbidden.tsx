import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const Forbidden = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      '[403 Forbidden] Unauthorized access attempt to route:',
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526]">
      <div className="text-center max-w-md p-8">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-[#D4AF37]" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-[#D4AF37] mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-[#FAFAFA] mb-4">Access Denied</h2>
        <p className="text-[#F4E4BC]/80 mb-8">
          You don't have permission to access this page. This area is restricted to authorized personnel only.
        </p>
        <Button 
          onClick={() => navigate('/investor-portal')}
          className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] hover:opacity-90"
        >
          Return to Investor Portal
        </Button>
      </div>
    </div>
  );
};

export default Forbidden;
