import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    { quote: "DealFlow transformed how we manage our acquisition pipeline. We've reduced deal cycle time by 40%.", author: "Sarah Chen", title: "Managing Director, Vista Capital Partners", metric: "40% faster", metricLabel: "deal cycles" },
    { quote: "The due diligence tracker alone has saved us hundreds of hours. No more chasing documents.", author: "Michael Torres", title: "Partner, Meridian Private Equity", metric: "300+ hours", metricLabel: "saved monthly" },
    { quote: "Finally, a platform that understands M&A workflows. The integration features are seamless.", author: "Jennifer Walsh", title: "VP of Corporate Development, TechScale Inc", metric: "2x faster", metricLabel: "integrations" },
  ];

  useEffect(() => {
    const interval = setInterval(() => setActiveIndex((prev) => (prev + 1) % testimonials.length), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#0D1117]">
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[400px] bg-[#D4AF37]/3 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by M&A teams worldwide</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-blue-500/5 rounded-3xl blur-2xl" />
          <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />)}</div>
            <AnimatePresence mode="wait">
              <motion.div key={activeIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">"{testimonials[activeIndex].quote}"</p>
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#B8962E]/30 flex items-center justify-center"><span className="text-lg font-semibold text-white">{testimonials[activeIndex].author.charAt(0)}</span></div>
                    <div><p className="font-semibold text-white">{testimonials[activeIndex].author}</p><p className="text-sm text-white/40">{testimonials[activeIndex].title}</p></div>
                  </div>
                  <div className="text-right"><p className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] bg-clip-text text-transparent">{testimonials[activeIndex].metric}</p><p className="text-sm text-white/40">{testimonials[activeIndex].metricLabel}</p></div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">{testimonials.map((_, i) => <button key={i} onClick={() => setActiveIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-[#D4AF37]' : 'bg-white/20'}`} />)}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveIndex((p) => (p - 1 + testimonials.length) % testimonials.length)} className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08]"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setActiveIndex((p) => (p + 1) % testimonials.length)} className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08]"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
