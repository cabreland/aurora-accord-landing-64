
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroProps {
  onScrollToPhases: () => void;
}

const Hero = ({ onScrollToPhases }: HeroProps) => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1C2526] via-[#2A3B3C] to-[#1C2526] pt-16">
      {/* Hexagonal Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-16 h-16 border-2 border-[#FFC107] transform rotate-45"></div>
        <div className="absolute top-40 right-32 w-12 h-12 border-2 border-[#FFC107] transform rotate-45 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-[#FFC107] transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-14 h-14 border-2 border-[#FFC107] transform rotate-45 animate-pulse"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/a70012ca-4619-4635-9f2c-e23113854a06.png" 
            alt="Exclusive Business Brokers" 
            className="w-32 h-32 mx-auto mb-6 filter brightness-0 invert"
          />
          <Badge className="bg-[#FFC107] text-black border-[#FFC107] mb-6 text-sm font-semibold px-4 py-2">
            M&A Automation Strategy & Implementation Proposal
          </Badge>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-white">Transforming M&A with </span>
          <span className="text-[#FFC107] relative">
            Automation
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFC107] animate-pulse"></div>
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto font-light italic">
          Built for Jack's team. Powered by AI. Designed to scale.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onScrollToPhases}
            className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Jump to Plan
          </Button>
          <Button 
            variant="outline" 
            className="border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-black px-8 py-4 text-lg transition-all duration-200"
          >
            Executive Summary
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
