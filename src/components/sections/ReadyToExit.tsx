import React from 'react';
import { Button } from '@/components/ui/button';

const ReadyToExit = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#1A1F2E] to-[#0A0F0F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-[#D4AF37] rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#22C55E] rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-[#D4AF37] rounded-full animate-pulse opacity-60"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-12 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
          Ready to Exit?
        </h2>
        
        <Button 
          onClick={() => window.open('https://calendly.com/your-calendar-link', '_blank')}
          className="relative bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] hover:from-[#F4E4BC] hover:to-[#D4AF37] text-[#0A0F0F] font-bold px-12 py-6 text-xl transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#D4AF37]/40 border-2 border-[#D4AF37] overflow-hidden group"
        >
          <span className="relative z-10">Book a Call Now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </Button>
      </div>
    </section>
  );
};

export default ReadyToExit;