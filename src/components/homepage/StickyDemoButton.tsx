import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StickyDemoButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const footerOffset = document.documentElement.scrollHeight - window.innerHeight - 500;
      const currentScroll = window.scrollY;

      // Show after scrolling past hero, hide near footer
      setIsVisible(currentScroll > heroHeight && currentScroll < footerOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] hover:opacity-90 font-semibold shadow-lg shadow-[#D4AF37]/30 rounded-full px-6"
            >
              Request Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyDemoButton;
