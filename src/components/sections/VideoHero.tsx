import React from 'react';
import { Button } from '@/components/ui/button';

const VideoHero = () => {
  return (
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden">
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
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Bottom Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16">
        <div className="flex justify-between items-end">
          {/* Center Headline */}
          <div className="flex-1 text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white drop-shadow-lg">
              Fast, safe, and easy
            </h1>
          </div>
          
          {/* Bottom Right Info Box */}
          <div className="bg-gradient-to-br from-yellow-600/90 to-yellow-500/90 backdrop-blur-sm rounded-2xl p-8 max-w-sm border border-yellow-400/30">
            <h2 className="text-2xl font-bold text-white mb-6">Bishoi's Story</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white text-sm leading-relaxed">
                  Started a business with limited resources and grew it to a successful exit
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white text-sm leading-relaxed">
                  Learned the complexities of business sales firsthand
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white text-sm leading-relaxed">
                  Now helps other entrepreneurs navigate their exit journey
                </p>
              </div>
            </div>
            
            <Button 
              className="w-full bg-white text-yellow-700 hover:bg-gray-100 font-bold py-3 rounded-xl shadow-lg"
            >
              Book a Call
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;