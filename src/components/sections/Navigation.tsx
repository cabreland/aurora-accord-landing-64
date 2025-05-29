
import React from 'react';

const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] z-50 px-6 py-4 shadow-2xl backdrop-blur-sm border-b border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">M&A Automation Strategy</div>
        <div className="hidden md:flex space-x-8 text-sm font-semibold">
          <button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0A0F0F]/80 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-[#0A0F0F]/10">
            Overview
          </button>
          <button onClick={() => document.getElementById('phases')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0A0F0F]/80 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-[#0A0F0F]/10">
            Phases
          </button>
          <button onClick={() => document.getElementById('metrics')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0A0F0F]/80 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-[#0A0F0F]/10">
            Metrics
          </button>
          <button onClick={() => document.getElementById('investment')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0A0F0F]/80 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-[#0A0F0F]/10">
            Investment
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
