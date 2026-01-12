import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  'Sequoia', 'Andreessen', 'Blackstone', 'KKR', 'TPG', 'Carlyle', 'Bain', 'Apollo'
];

const LogoStrip = () => {
  return (
    <section className="py-12 bg-[#f8fafc] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm text-gray-500 mb-8">
          Powering M&A deals for the world's leading firms
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {logos.map((logo, index) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="text-xl font-semibold text-gray-300 hover:text-gray-400 transition-colors cursor-default"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoStrip;
