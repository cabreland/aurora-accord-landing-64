import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0C10]">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117] to-[#0A0C10]" />
        
        {/* Large gold glow */}
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[500px] bg-[#D4AF37]/8 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-8">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-white/60">Start your free trial</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to transform your{' '}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
              M&A process?
            </span>
          </h2>
          
          <p className="text-lg text-white/40 mb-10 max-w-2xl mx-auto">
            Join 500+ M&A teams already using DealFlow to close deals faster, manage due diligence smarter, and integrate seamlessly.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-[#0A0C10] font-semibold px-8 h-14 text-base shadow-xl shadow-[#D4AF37]/25 transition-all duration-300"
              >
                Request a demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/[0.1] bg-white/[0.02] text-white hover:bg-white/[0.05] hover:border-white/[0.15] px-8 h-14 text-base transition-all duration-300"
            >
              Talk to sales
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
