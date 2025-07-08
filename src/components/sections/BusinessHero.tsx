import React from 'react';
import { Button } from '@/components/ui/button';

const BusinessHero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0F0F] via-[#1A1F2E] to-[#0A0F0F] pt-16 overflow-hidden">
      {/* Futuristic Animated Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Hexagonal Grid */}
        <div className="absolute top-20 left-20 w-16 h-16 border-2 border-[#D4AF37] transform rotate-45 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-12 h-12 border-2 border-[#D4AF37] transform rotate-45 animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-[#D4AF37] transform rotate-45 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-14 h-14 border-2 border-[#D4AF37] transform rotate-45 animate-pulse delay-500"></div>
        
        {/* Circuit Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#F4E4BC" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          <path d="M0,100 Q150,50 300,100 T600,100" stroke="url(#circuit-gradient)" strokeWidth="2" fill="none" className="animate-pulse">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="4s" repeatCount="indefinite"/>
          </path>
          <path d="M100,0 Q200,150 300,50 T600,0" stroke="url(#circuit-gradient)" strokeWidth="2" fill="none" className="animate-pulse delay-1000">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="6s" repeatCount="indefinite"/>
          </path>
        </svg>
        
        {/* Floating Data Nodes */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-[#D4AF37] rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#22C55E] rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-[#D4AF37] rounded-full animate-pulse opacity-60"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          <span className="text-[#FAFAFA] drop-shadow-lg">We'll Sell Your Business and Close the</span>
          <br />
          <span className="text-[#FAFAFA] drop-shadow-lg">Transaction in </span>
          <span className="relative bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            90 Days or Less
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] blur-sm animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37]"></div>
          </span>
          <br />
          <span className="text-[#FAFAFA] drop-shadow-lg">for </span>
          <span className="relative bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            Zero Upfront Cost
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-[#F4E4BC] mb-8 max-w-4xl mx-auto font-light">
          ...Including Your Legal & Escrow Fees, and Hands-On Support from Start to Finish
        </p>
        
        <Button 
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] hover:from-[#F4E4BC] hover:to-[#D4AF37] text-[#0A0F0F] font-bold px-12 py-6 text-xl transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#D4AF37]/40 border-2 border-[#D4AF37] overflow-hidden group"
        >
          <span className="relative z-10">Book a Call Now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </Button>
      </div>

      {/* Scanning Lines Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse delay-1000"></div>
      </div>
    </section>
  );
};

export default BusinessHero;