import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const comparisons = [
  { 
    old: 'Scattered emails and shared drives',
    new: 'Centralized, searchable data room'
  },
  { 
    old: 'Manual NDA tracking in spreadsheets',
    new: 'Automated NDA workflow with e-signatures'
  },
  { 
    old: 'No visibility into document access',
    new: 'Real-time activity logs and analytics'
  },
  { 
    old: 'Inconsistent investor communication',
    new: 'Structured messaging with full audit trail'
  },
  { 
    old: 'Risk of data breaches',
    new: 'Enterprise-grade security and encryption'
  },
];

const InteractiveComparison = () => {
  return (
    <section id="comparison" className="relative py-24 bg-[#0A0C10]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The <span className="text-red-400">old way</span> vs{' '}
            <span className="text-[#D4AF37]">the DealFlow way</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            See how DealFlow transforms your M&A operations
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-4">
            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {/* Old Way */}
                <motion.div 
                  whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)' }}
                  className="flex items-center gap-4 p-5 rounded-xl bg-red-500/5 border border-red-500/10 cursor-default transition-all duration-300"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  </motion.div>
                  <span className="text-white/70">{item.old}</span>
                </motion.div>
                
                {/* New Way */}
                <motion.div 
                  whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(212, 175, 55, 0.15)' }}
                  className="flex items-center gap-4 p-5 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 cursor-default transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  </motion.div>
                  <span className="text-white">{item.new}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveComparison;
