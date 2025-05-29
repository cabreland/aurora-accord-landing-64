
import React from 'react';
import { Badge } from '@/components/ui/badge';

const Footer = () => {
  return (
    <footer className="py-16 bg-[#0A0F0F] text-center border-t border-[#D4AF37]/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="space-y-6">
          <p className="text-[#F4E4BC] text-lg font-medium">
            M&A Automation Strategy & Implementation Proposal
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 text-[#F4E4BC]">
            <span className="flex items-center space-x-2">
              <span>Powered by</span>
              <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] font-bold px-4 py-2 shadow-lg">
                Web Launch
              </Badge>
            </span>
            <div className="hidden sm:block w-px h-6 bg-[#D4AF37]/30"></div>
            <span>Built for Exclusive Business Brokers</span>
          </div>
          
          <div className="pt-8 border-t border-[#D4AF37]/20">
            <p className="text-[#F4E4BC]/60 text-sm">
              Confidential implementation proposal • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
