import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TourBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-gradient-to-r from-[#0A0C10] via-[#1a1d24] to-[#0A0C10] border-b border-[#D4AF37]/20"
        >
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-sm md:text-base text-white/80">
                  <span className="font-semibold text-white">Explore DealFlow Platform!</span>
                  {' '}Discover how M&A brokers run faster deals in one platform.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] hover:opacity-90 font-semibold whitespace-nowrap"
                >
                  START TOUR
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <button 
                  onClick={() => setIsDismissed(true)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white/50 hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TourBanner;
