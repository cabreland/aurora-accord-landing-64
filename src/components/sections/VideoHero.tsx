import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Play } from 'lucide-react';

const VideoHero = () => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src="https://www.youtube.com/embed/Wua-TMQlqIs?autoplay=1&mute=1&loop=1&playlist=Wua-TMQlqIs&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1"
          title="Background Video"
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Header Navigation */}
      <div className="relative z-10 w-full">
        <nav className="flex items-center justify-between px-8 py-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-black transform rotate-45"></div>
            </div>
            <span className="text-white text-xl font-bold">EBB</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white hover:text-[#D4AF37] transition-colors">Case Studies</a>
            <a href="#" className="text-white hover:text-[#D4AF37] transition-colors">About</a>
            <a href="#" className="text-white hover:text-[#D4AF37] transition-colors">Blog</a>
            <a href="#" className="text-white hover:text-[#D4AF37] transition-colors">FAQs</a>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 rounded-full px-6"
            >
              For Buyers
            </Button>
            <Button 
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold rounded-full px-6"
            >
              Apply to Sell
            </Button>
          </div>
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8">
        {/* Main Headline */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight max-w-5xl">
            Sell Your Digital Business in 60 Days or Less for No Upfront Cost
          </h1>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-green-600/80 backdrop-blur-sm rounded-full px-6 py-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white font-medium">No upfront fees</span>
            </div>
            <div className="flex items-center gap-2 bg-green-600/80 backdrop-blur-sm rounded-full px-6 py-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Serious buyers</span>
            </div>
            <div className="flex items-center gap-2 bg-green-600/80 backdrop-blur-sm rounded-full px-6 py-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Premium valuations</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Right Info Box */}
      <div className="absolute bottom-8 right-8 bg-gradient-to-br from-[#D4AF37]/90 to-[#B8941F]/90 backdrop-blur-sm rounded-2xl p-6 max-w-xs border border-[#D4AF37]/50">
        <h3 className="text-xl font-bold text-black mb-4">Bishoi's Story</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-black flex-shrink-0" />
            <span className="text-black text-sm font-medium">Saved $10K+ in fees</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-black flex-shrink-0" />
            <span className="text-black text-sm font-medium">Sold for 3X EBITDA</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-black flex-shrink-0" />
            <span className="text-black text-sm font-medium">LOI by week 2</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-white text-black hover:bg-gray-100 font-bold py-2 rounded-xl shadow-lg mb-3"
        >
          Book a Call
        </Button>
        
        {/* Play Button */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;