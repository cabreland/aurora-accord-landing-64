
import React from 'react';
import { Badge } from '@/components/ui/badge';

const Footer = () => {
  return (
    <footer className="py-12 bg-black text-center border-t border-[#4A5D70]">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-gray-500 mb-4">
          M&A Automation Strategy & Implementation Proposal
        </p>
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <span>Powered by</span>
          <Badge className="bg-[#FFC107] text-black font-semibold">Web Launch</Badge>
          <span>• Built for Exclusive Business Brokers</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
