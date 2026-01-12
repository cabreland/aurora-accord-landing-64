import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote: "DealFlow transformed how we manage our M&A pipeline. The security features alone saved us countless hours of compliance work.",
    author: "Michael Chen",
    role: "Managing Partner",
    company: "Apex Capital Partners"
  },
  {
    quote: "The due diligence tracking is exceptional. We've cut our deal cycle time by 40% since implementing the platform.",
    author: "Sarah Williams",
    role: "Director of Operations",
    company: "Sterling Acquisitions"
  },
  {
    quote: "Finally, a data room built by people who understand M&A. The investor portal is exactly what we needed.",
    author: "David Park",
    role: "VP of Business Development",
    company: "Harbor Growth Equity"
  },
  {
    quote: "The automation features have been a game-changer. We're handling twice the deal volume with the same team.",
    author: "Jennifer Lee",
    role: "Principal",
    company: "Venture Bridge Partners"
  },
  {
    quote: "Best-in-class security combined with an intuitive interface. Our clients love the experience.",
    author: "Robert Martinez",
    role: "Senior Associate",
    company: "Summit M&A Advisors"
  },
  {
    quote: "The integration capabilities saved us months of manual work. Highly recommend for any M&A firm.",
    author: "Amanda Foster",
    role: "COO",
    company: "Meridian Capital Group"
  },
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (testimonials.length - itemsPerView + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, itemsPerView]);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section id="testimonials" className="relative py-24 bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trusted by <span className="text-[#D4AF37]">industry leaders</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            See what M&A professionals are saying about DealFlow
          </p>
        </motion.div>

        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Carousel */}
          <div className="px-12">
            <motion.div
              className="flex gap-6"
              animate={{ x: `${-currentIndex * (100 / itemsPerView)}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] h-full">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="text-white/80 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                    <div>
                      <div className="font-semibold text-white">{testimonial.author}</div>
                      <div className="text-sm text-white/50">{testimonial.role}</div>
                      <div className="text-sm text-[#D4AF37]">{testimonial.company}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-[#D4AF37] w-6' 
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
