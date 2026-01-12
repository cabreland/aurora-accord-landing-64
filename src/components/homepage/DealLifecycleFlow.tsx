import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, BarChart3, FileSearch, Lock, Handshake, GitMerge,
  FileCheck, CheckCircle2, ArrowRight
} from 'lucide-react';

interface Stage {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
}

interface Milestone {
  id: string;
  label: string;
  afterStage: number;
}

const stages: Stage[] = [
  { id: 'sourcing', icon: Search, label: 'Deal Sourcing', description: 'Identify and qualify potential opportunities' },
  { id: 'pipeline', icon: BarChart3, label: 'Pipeline Management', description: 'Track deals through your funnel' },
  { id: 'diligence', icon: FileSearch, label: 'Due Diligence', description: 'Comprehensive investigation and verification' },
  { id: 'dataroom', icon: Lock, label: 'Data Room', description: 'Secure document exchange' },
  { id: 'close', icon: Handshake, label: 'Transaction Close', description: 'Finalize the deal' },
  { id: 'integration', icon: GitMerge, label: 'Post-Close Integration', description: 'Manage transition and integration' },
];

const milestones: Milestone[] = [
  { id: 'nda', label: 'NDA Signed', afterStage: 1 },
  { id: 'closed', label: 'Deal Closed', afterStage: 4 },
];

const products = [
  {
    icon: BarChart3,
    title: 'DealFlow Pipeline',
    description: 'Manage your entire deal pipeline from initial contact to LOI',
    features: ['Visual deal tracking', 'Automated stage progression', 'Team collaboration'],
  },
  {
    icon: FileSearch,
    title: 'DealFlow Diligence',
    description: 'Comprehensive due diligence tracking with automated workflows',
    features: ['Request management', 'Document tracking', 'Progress analytics'],
  },
  {
    icon: Lock,
    title: 'DealFlow DataRoom',
    description: 'Secure, SOC-2 compliant data rooms with granular access control',
    features: ['256-bit encryption', 'Watermarking', 'Audit trails'],
  },
];

const DealLifecycleFlow = () => {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  return (
    <section className="relative py-24 bg-[#0A0C10]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Master the <span className="text-[#D4AF37]">Deal Lifecycle</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            From sourcing to integration, DealFlow guides you through every stage
          </p>
        </motion.div>

        {/* Flowchart */}
        <div className="relative mb-16">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 hidden lg:block" />
          
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-4 lg:gap-0">
            {stages.map((stage, index) => {
              const milestone = milestones.find(m => m.afterStage === index);
              
              return (
                <React.Fragment key={stage.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative z-10"
                  >
                    <button
                      onMouseEnter={() => setActiveStage(stage.id)}
                      onMouseLeave={() => setActiveStage(null)}
                      className={`group relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                        activeStage === stage.id 
                          ? 'bg-[#D4AF37]/10 shadow-[0_0_30px_rgba(212,175,55,0.3)]' 
                          : 'bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                        activeStage === stage.id 
                          ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8962E] shadow-lg shadow-[#D4AF37]/30' 
                          : 'bg-white/[0.05] group-hover:bg-[#D4AF37]/20'
                      }`}>
                        <stage.icon className={`w-6 h-6 transition-colors ${
                          activeStage === stage.id ? 'text-[#0A0C10]' : 'text-[#D4AF37]'
                        }`} />
                      </div>
                      <span className={`text-sm font-medium text-center whitespace-nowrap transition-colors ${
                        activeStage === stage.id ? 'text-[#D4AF37]' : 'text-white/80'
                      }`}>
                        {stage.label}
                      </span>
                      
                      {/* Tooltip */}
                      {activeStage === stage.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full mt-3 px-4 py-2 bg-[#1a1d24] border border-white/10 rounded-lg shadow-xl z-20 w-48"
                        >
                          <p className="text-xs text-white/70 text-center">{stage.description}</p>
                        </motion.div>
                      )}
                    </button>
                  </motion.div>

                  {/* Arrow */}
                  {index < stages.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-white/20 hidden lg:block flex-shrink-0 mx-2" />
                  )}

                  {/* Milestone */}
                  {milestone && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (index + 0.5) * 0.1 }}
                      className="hidden lg:flex items-center mx-2"
                    >
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs font-medium text-[#D4AF37]">{milestone.label}</span>
                      </div>
                    </motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-[#D4AF37]/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center mb-4 group-hover:from-[#D4AF37]/30 group-hover:to-[#D4AF37]/10 transition-all">
                <product.icon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{product.title}</h3>
              <p className="text-sm text-white/60 mb-4">{product.description}</p>
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-white/50">
                    <FileCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealLifecycleFlow;
