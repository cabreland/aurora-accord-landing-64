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
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0a1628] italic mb-4">
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
            className="bg-white p-8 lg:p-12"
          >
            <h3 className="text-2xl font-bold text-[#0a1628] mb-8">The old way</h3>
            <div className="space-y-6">
              {oldWayItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="group"
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* The DealFlow way */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#0a1628] p-8 lg:p-12 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl"
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
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Center Screenshots - Overlay effect */}
        <div className="relative -mt-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex gap-4 -mt-16"
          >
            {/* Old way screenshot mockup */}
            <div className="w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-12 h-3 bg-gray-200 rounded" />
                      <div className="w-16 h-3 bg-gray-100 rounded" />
                      <div className="w-20 h-3 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-2 self-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* New way screenshot mockup */}
            <div className="w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform">
              <div className="bg-[#0a1628] px-3 py-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="p-3 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100">
                    <div className="w-6 h-6 rounded bg-blue-100" />
                    <div className="flex-1">
                      <div className="w-20 h-2.5 bg-gray-200 rounded mb-1" />
                      <div className="w-12 h-2 bg-gray-100 rounded" />
                    </div>
                    <div className="w-12 h-5 bg-green-100 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100">
                    <div className="w-6 h-6 rounded bg-purple-100" />
                    <div className="flex-1">
                      <div className="w-24 h-2.5 bg-gray-200 rounded mb-1" />
                      <div className="w-16 h-2 bg-gray-100 rounded" />
                    </div>
                    <div className="w-12 h-5 bg-blue-100 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
