import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "DealFlow changed the game for us. Now we can really see in real-time who's falling behind, who's on track, and where we're hitting blockers. I don't have to wait for Monday meetings to get that status.",
    author: "Sarah Williams",
    role: "Senior Vice President",
    company: "Apex Capital Partners",
  },
  {
    quote: "42+ hours of time savings. 15+ deals, over $500M in enterprise value. The ROI speaks for itself.",
    author: "Michael Chen",
    role: "Managing Director",
    company: "Sterling Acquisitions",
  },
  {
    quote: "35 hours saved per deal. Completed 2+ deals simultaneously. We couldn't have done it without DealFlow.",
    author: "Jennifer Park",
    role: "Partner",
    company: "Harbor Growth Equity",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="py-24 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            See why leading teams choose DealFlow's<br />
            M&A software
          </h2>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center hover:bg-[#1d4ed8] transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className={`p-6 rounded-2xl bg-[#1a2744] border border-white/10 hover:border-white/20 transition-colors ${
                index === activeIndex ? 'ring-2 ring-blue-500/30' : ''
              }`}
            >
              <Quote className="w-8 h-8 text-white/20 mb-4" />
              <p className="text-white/80 mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{testimonial.author}</div>
                  <div className="text-xs text-white/50">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex ? 'bg-[#2563eb] w-4' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
