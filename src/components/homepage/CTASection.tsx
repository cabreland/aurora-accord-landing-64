import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Partner logos (text placeholders)
  const logos = ['DealRoom', 'Intralinks', 'Datasite', 'Firmex', 'Ansarada', 'Box'];

  return (
    <section ref={ref} className="py-20 bg-[#0a1628]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Discover the power of DealFlow today
          </h2>
          
          <Link to="/auth">
            <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-8 h-12 mb-12">
              Request a demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          {/* Partner Logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {logos.map((logo) => (
              <span key={logo} className="text-white/60 text-sm font-medium">
                {logo}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
