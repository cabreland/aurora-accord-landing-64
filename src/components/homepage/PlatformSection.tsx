import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BarChart3, FileSearch, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PlatformSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const products = [
    {
      icon: BarChart3,
      title: 'DealFlow Pipeline',
      description: 'Manage your entire deal pipeline from initial contact to LOI with visual tracking and automated workflows.',
    },
    {
      icon: FileSearch,
      title: 'DealFlow Diligence',
      description: 'Comprehensive due diligence tracking with request management, document organization, and progress analytics.',
    },
    {
      icon: Lock,
      title: 'DealFlow Integration',
      description: 'Seamlessly manage post-close integration with task tracking, team collaboration, and synergy realization.',
    },
  ];

  const stages = ['Deal Sourcing', 'Due Diligence', 'Integration', 'Day 1-100'];

  return (
    <section ref={ref} className="py-24 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Only Platform Purpose-Built<br />
            for Buyer-Led M&A™
          </h2>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-16"
        >
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            {stages.map((stage, index) => (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-white/20 mb-3" />
                  <span className="text-sm text-white/60 whitespace-nowrap">{stage}</span>
                </div>
                {index < stages.length - 1 && (
                  <div className="flex-1 h-px bg-white/10 mx-4 mt-[-18px]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/15 transition-colors">
                <product.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{product.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{product.description}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white/80">+ DealFlow AI</span>
          </div>
          
          <p className="text-white/40 text-sm max-w-xl mx-auto mb-8">
            Powered by AI to automate repetitive tasks, surface insights, and accelerate your deal execution.
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/auth">
              <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
                Request a demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformSection;
