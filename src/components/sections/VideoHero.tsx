import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Play } from 'lucide-react';

const VideoHero = () => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src="https://www.youtube.com/embed/Wua-TMQlqIs?autoplay=1&mute=1&loop=1&playlist=Wua-TMQlqIs&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
          title="Background Video"
          className="w-full h-full object-cover"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ pointerEvents: 'none' }}
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Header Navigation */}
      <div className="relative z-10 w-full">
        <nav className="flex items-center justify-between px-8 py-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white transform rotate-45"></div>
            </div>
            <span className="text-white text-xl font-bold">EBB</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white hover:text-yellow-400 transition-colors">Case Studies</a>
            <a href="#" className="text-white hover:text-yellow-400 transition-colors">About</a>
            <a href="#" className="text-white hover:text-yellow-400 transition-colors">Blog</a>
            <a href="#" className="text-white hover:text-yellow-400 transition-colors">FAQs</a>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              For Buyers
            </Button>
            <Button 
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
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
      <div className="absolute bottom-8 right-8 bg-gradient-to-br from-yellow-600/90 to-yellow-500/90 backdrop-blur-sm rounded-2xl p-6 max-w-xs border border-yellow-400/30">
        <h3 className="text-xl font-bold text-white mb-4">Bishoi's Story</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-white flex-shrink-0" />
            <span className="text-white text-sm">Saved $10K+ in fees</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-white flex-shrink-0" />
            <span className="text-white text-sm">Sold for 3X EBITDA</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-white flex-shrink-0" />
            <span className="text-white text-sm">LOI by week 2</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-white text-yellow-700 hover:bg-gray-100 font-bold py-2 rounded-xl shadow-lg mb-3"
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