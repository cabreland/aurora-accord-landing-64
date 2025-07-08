import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const BusinessFooter = () => {
  return (
    <footer className="py-16 bg-[#0A0F0F] text-center border-t border-[#D4AF37]/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="space-y-8">
          {/* Logo and Company Name */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-[#D4AF37] flex items-center justify-center transform rotate-45">
              <span className="text-[#0A0F0F] font-bold text-xl transform -rotate-45">EB</span>
            </div>
            <span className="text-[#F4E4BC] text-2xl font-bold">Exclusive Business Brokers</span>
          </div>
          
          <p className="text-[#F4E4BC] text-lg font-medium">
            White Glove Business Brokerage Services
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-[#F4E4BC]">
            <Link to="/" className="hover:text-[#D4AF37] transition-colors">
              Home
            </Link>
            <Link to="/investor-portal" className="hover:text-[#D4AF37] transition-colors">
              Investor Portal
            </Link>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </div>
          
          <div className="pt-8 border-t border-[#D4AF37]/20">
            <p className="text-[#F4E4BC]/60 text-sm">
              Copyright © {new Date().getFullYear()} Exclusive Business Brokers. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BusinessFooter;