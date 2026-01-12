import React from 'react';
import { motion } from 'framer-motion';

const LogoStrip = () => {
  const logos = ['Goldman Sachs', 'Blackstone', 'KKR', 'Apollo', 'Carlyle', 'TPG', 'Bain Capital', 'Vista Equity'];

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0C10]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D1117] to-transparent" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-sm text-white/30 mb-10 uppercase tracking-widest">
          Trusted by leading investment firms worldwide
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {logos.map((logo, i) => (
            <span key={logo} className="text-lg font-semibold text-white/20 hover:text-white/30 transition-colors">{logo}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LogoStrip;
