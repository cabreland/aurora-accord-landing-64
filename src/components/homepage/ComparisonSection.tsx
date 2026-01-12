import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';

const ComparisonSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const oldWayItems = [
    { title: 'Data silos', description: 'Deal info scattered across tools' },
    { title: 'Manual processes', description: 'Tedious data entry and updates' },
    { title: 'Visibility gaps', description: 'Slow decisions & misalignment' },
    { title: 'Access issues', description: 'No control, security risks' },
  ];

  const newWayItems = [
    { title: 'Single source of truth', description: 'All deal data in one place' },
    { title: 'Process automation', description: 'Workflows accelerate execution' },
    { title: 'Real-time visibility', description: 'Updates keep teams aligned' },
    { title: 'Granular access control', description: 'Right people, right info' },
  ];

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0D1117]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D1117] to-[#0A0C10]" />
        {/* Subtle radial gradient */}
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Say goodbye to{' '}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
              painful
            </span>{' '}
            deal execution
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Transform your M&A workflow from chaotic to streamlined
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* The old way */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm p-8 lg:p-10 rounded-2xl border border-white/[0.06] h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white/70">The old way</h3>
              </div>
              
              <div className="space-y-5">
                {oldWayItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-400/70" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-white/60 mb-0.5">{item.title}</h4>
                      <p className="text-sm text-white/30">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* The DealFlow way */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/15 to-blue-500/10 rounded-2xl blur-xl opacity-60" />
            <div className="relative bg-white/[0.03] backdrop-blur-sm p-8 lg:p-10 rounded-2xl border border-[#D4AF37]/20 h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold text-white">The DealFlow way</h3>
              </div>
              
              <div className="space-y-5">
                {newWayItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#D4AF37]/20 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-white mb-0.5">{item.title}</h4>
                      <p className="text-sm text-white/50">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <a 
            href="/auth" 
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F4E4BC] font-medium transition-colors group"
          >
            See how teams transform their workflow
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
