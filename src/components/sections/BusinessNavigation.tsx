import React from 'react';
import { Link } from 'react-router-dom';

const BusinessNavigation = () => {
  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] z-50 px-6 py-4 shadow-2xl backdrop-blur-sm border-b border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0A0F0F] flex items-center justify-center transform rotate-45">
            <span className="text-[#D4AF37] font-bold text-lg transform -rotate-45">EB</span>
          </div>
          <div className="font-bold text-xl">Exclusive Business Brokers</div>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-semibold">
          <button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0A0F0F]/80 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-[#0A0F0F]/10">
            Home
          </button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0A0F0F]/80 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-[#0A0F0F]/10">
            Process
          </button>
          <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0A0F0F]/80 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-[#0A0F0F]/10">
            Testimonials
          </button>
          <Link to="/investor-portal">
            <button className="hover:text-[#0A0F0F]/80 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-[#0A0F0F]/10">
              Investor Portal
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BusinessNavigation;