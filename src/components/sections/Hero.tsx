
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface HeroProps {
  onScrollToPhases: () => void;
}

const Hero = ({ onScrollToPhases }: HeroProps) => {
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
      
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Header Badge */}
        <div className="mb-8">
          <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] border-[#D4AF37] mb-6 text-sm font-bold px-6 py-3 shadow-lg shadow-[#D4AF37]/30">
            Built from Jack's SOP Notes
          </Badge>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
          <span className="text-[#FAFAFA] drop-shadow-lg">Transforming M&A with </span>
          <span className="relative bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            Automation
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] blur-sm animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37]"></div>
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-[#F4E4BC] mb-4 max-w-3xl mx-auto font-light">
          Built for Jack's team. Powered by AI. Designed to scale.
        </p>
        
        <div className="flex items-center justify-center space-x-8 mb-8 text-[#D4AF37]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">140K+ emails/month</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse delay-300"></div>
            <span className="text-sm font-medium">1,000 inboxes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse delay-700"></div>
            <span className="text-sm font-medium">100+ daily responses</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            onClick={onScrollToPhases}
            className="relative bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] hover:from-[#F4E4BC] hover:to-[#D4AF37] text-[#0A0F0F] font-bold px-12 py-6 text-xl transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#D4AF37]/40 border-2 border-[#D4AF37] overflow-hidden group"
          >
            <span className="relative z-10">Jump to Plan</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Button>
          <Link to="/investor-portal">
            <Button 
              variant="outline" 
              className="border-2 border-[#F28C38] text-[#F28C38] hover:bg-[#F28C38] hover:text-[#0A0F0F] px-12 py-6 text-xl transition-all duration-300 bg-[#0A0F0F]/80 backdrop-blur-sm shadow-lg shadow-[#F28C38]/20"
            >
              Investor Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Scanning Lines Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse delay-1000"></div>
      </div>
    </section>
  );
};

export default Hero;
