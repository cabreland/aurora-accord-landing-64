import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BarChart3, FileSearch, Lock, Sparkles, ArrowRight, Zap, Shield, Users } from 'lucide-react';
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
      color: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: FileSearch,
      title: 'DealFlow Diligence',
      description: 'Comprehensive due diligence tracking with request management, document organization, and progress analytics.',
      color: 'from-emerald-500/20 to-emerald-600/10',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Lock,
      title: 'DealFlow Integration',
      description: 'Seamlessly manage post-close integration with task tracking, team collaboration, and synergy realization.',
      color: 'from-[#D4AF37]/20 to-[#D4AF37]/10',
      borderColor: 'border-[#D4AF37]/20',
      iconColor: 'text-[#D4AF37]',
    },
  ];

  const stages = [
    { label: 'Deal Sourcing', active: true },
    { label: 'Due Diligence', active: true },
    { label: 'Integration', active: true },
    { label: 'Day 1-100', active: false },
  ];

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0C10]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117] via-[#0A0C10] to-[#0D1117]" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6"
          >
            <Zap className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-white/60">Purpose-Built Platform</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            The Only Platform Built for{' '}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
              Buyer-Led M&A™
            </span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            From deal sourcing to integration, manage every stage of your acquisition lifecycle
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-20"
        >
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.label}>
                <div className="flex flex-col items-center group">
                  <div className={`w-4 h-4 rounded-full mb-3 transition-all duration-300 ${
                    stage.active 
                      ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8962E] shadow-lg shadow-[#D4AF37]/30' 
                      : 'bg-white/10 border border-white/20'
                  }`} />
                  <span className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    stage.active ? 'text-white/80' : 'text-white/40'
                  }`}>
                    {stage.label}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <div className="flex-1 mx-4 mt-[-22px]">
                    <div className={`h-0.5 rounded-full ${
                      stage.active && stages[index + 1]?.active
                        ? 'bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37]/30'
                        : 'bg-white/10'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${product.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className={`relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] group-hover:border-white/[0.12] h-full transition-all duration-300 group-hover:bg-white/[0.04]`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} border ${product.borderColor} flex items-center justify-center mb-5`}>
                  <product.icon className={`w-6 h-6 ${product.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{product.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{product.description}</p>
                
                <a href="/auth" className="inline-flex items-center gap-1 mt-5 text-sm text-white/60 hover:text-white transition-colors group/link">
                  Learn more 
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-blue-500/5 to-[#D4AF37]/10 rounded-2xl blur-2xl" />
          
          <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37]/10 to-blue-500/10 border border-[#D4AF37]/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm font-medium text-white">Powered by AI</span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">DealFlow AI</h3>
            <p className="text-white/40 text-base max-w-xl mx-auto mb-8">
              Automate repetitive tasks, surface insights from documents, and accelerate your deal execution with AI-powered intelligence.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Document Analysis', 'Risk Assessment', 'Smart Insights', 'Auto-Categorization'].map((feature) => (
                <span 
                  key={feature}
                  className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white/60"
                >
                  {feature}
                </span>
              ))}
            </div>

            <Link to="/auth">
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-[#0A0C10] font-semibold px-8 shadow-lg shadow-[#D4AF37]/20">
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
