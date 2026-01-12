import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ComparisonSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const oldWayItems = [
    { title: 'Data silos', description: 'Deal info is scattered across tools, causing inefficiencies.' },
    { title: 'Manual processes', description: 'Tedious data entry and updating multiple tools to stay aligned.' },
    { title: 'Visibility gaps', description: 'Lack of real-time updates slow decisions & create misalignment.' },
    { title: 'Access issues', description: 'No control over who sees what, leading to security risks.' },
  ];

  const newWayItems = [
    { title: 'Single source of truth', description: 'All deal data in one place, eliminating silos.' },
    { title: 'Process automation', description: 'Workflows reduce manual work & accelerate execution.' },
    { title: 'Visibility at every step', description: 'Real-time updates & notifications keep teams aligned.' },
    { title: 'Granular access control', description: 'The right people get the right info, securely.' },
  ];

  return (
    <section ref={ref} className="py-24 bg-[#0d1d35]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white italic mb-4">
            Say goodbye to painful deal<br />
            execution and missed synergies
          </h2>
        </motion.div>

        {/* Comparison Layout */}
        <div className="grid lg:grid-cols-2 gap-0 items-stretch">
          {/* The old way */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#1a2744] p-8 lg:p-12 rounded-2xl lg:rounded-r-none border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-8">The old way</h3>
            <div className="space-y-6">
              {oldWayItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="group"
                >
                  <h4 className="text-lg font-semibold text-white/80 mb-1">{item.title}</h4>
                  <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* The DealFlow way */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-8 lg:p-12 rounded-2xl lg:rounded-l-none border border-blue-500/20"
          >
            <h3 className="text-2xl font-bold text-white mb-8">The DealFlow way</h3>
            <div className="space-y-6">
              {newWayItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="group"
                >
                  <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
