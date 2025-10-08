import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const ModernHero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-[#0A0F0F] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Sell Your Digital Business in{' '}
              <span className="text-[#D4AF37]">60 Days or Less</span>{' '}
              for No Upfront Cost
            </h1>
            <p className="text-lg text-gray-400 max-w-xl">
              We handle everything from valuation to closing, with zero upfront fees. Get paid faster with our proven process.
            </p>
            <Button 
              className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-black font-semibold px-8 py-6 text-lg rounded-full"
            >
              Book a Call
            </Button>
          </div>

          {/* Right Video/Image */}
          <div className="relative">
            <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/20" />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30"
                >
                  <Play className="w-8 h-8 text-white fill-white" />
                </Button>
              </div>
              {/* Stats Overlay */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-300 mb-1">Average Sale Price</div>
                <div className="text-2xl font-bold text-[#D4AF37]">$500K+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHero;
