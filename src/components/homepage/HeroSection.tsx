import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Refined Background - Matching Auth Page */}
      <div className="absolute inset-0 bg-[#0A0C10]">
        {/* Gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0C10] via-[#111318] to-[#0A0C10]" />
        
        {/* Gold accent glow - top left - muted on mobile */}
        <div className="absolute top-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#D4AF37]/5 md:bg-[#D4AF37]/8 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        
        {/* Blue accent glow - bottom right - muted on mobile */}
        <div className="absolute bottom-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/5 md:bg-blue-500/8 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4" />
        
        {/* Center subtle glow - hidden on mobile */}
        <div className="hidden md:block absolute top-1/2 left-1/2 w-[800px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[180px] -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid pattern overlay - hidden on mobile for cleaner look */}
        <div 
          className="hidden md:block absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-8"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-white/70">AI-Powered M&A Platform</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-[58px] font-bold text-white leading-[1.1] tracking-tight mb-6">
              You can't scale M&A with{' '}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
                duct tape
              </span>{' '}
              and Excel.
            </h1>
            
            <p className="text-lg text-white/50 mb-10 leading-relaxed max-w-lg">
              Stop firefighting. Start leading. The best M&A teams use DealFlow to create repeatable workflows and close deals faster.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-[#0A0C10] font-semibold px-8 py-4 h-14 text-base shadow-lg shadow-[#D4AF37]/20 transition-all duration-300"
                >
                  Request a demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/[0.1] bg-white/[0.02] text-white hover:bg-white/[0.05] hover:border-white/[0.15] px-8 py-4 h-14 text-base transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Watch video
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#B8962E]/30 border-2 border-[#0A0C10] flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-white/70">{String.fromCharCode(64 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40">
                Trusted by <span className="text-white/60 font-medium">500+</span> M&A teams worldwide
              </p>
            </div>
          </motion.div>

          {/* Right - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-blue-500/10 rounded-3xl blur-2xl transform scale-105" />
            
            <div className="relative bg-[#0D1117]/80 backdrop-blur-xl rounded-2xl p-1 shadow-2xl border border-white/[0.08]">
              {/* Mock Dashboard */}
              <div className="bg-[#0A0C10] rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#0D1117] border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  <span className="ml-3 text-xs text-white/30">DealFlow Dashboard</span>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-[#D4AF37]">24</div>
                      <div className="text-xs text-white/40 mt-1">Active Deals</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-emerald-400">$45M</div>
                      <div className="text-xs text-white/40 mt-1">Pipeline Value</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-blue-400">89%</div>
                      <div className="text-xs text-white/40 mt-1">Win Rate</div>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-white/60">Deal Progress</span>
                      <span className="text-xs text-[#D4AF37]">+12% this month</span>
                    </div>
                    <div className="flex items-end justify-between h-20 gap-2">
                      {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                          className="flex-1 bg-gradient-to-t from-[#D4AF37] to-[#F4E4BC] rounded-sm opacity-80"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs text-white/60 flex-1">NDA signed - Acme Corp</span>
                      <span className="text-xs text-white/30">2m ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                      <span className="text-xs text-white/60 flex-1">Due diligence complete</span>
                      <span className="text-xs text-white/30">1h ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -right-4 top-12 bg-[#0D1117] rounded-xl shadow-xl px-4 py-3 border border-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">Deal Closed</span>
                    <p className="text-xs text-white/40">$2.4M acquisition</p>
                  </div>
                </div>
              </motion.div>

              {/* Second floating element */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -left-4 bottom-16 bg-[#0D1117] rounded-xl shadow-xl px-4 py-3 border border-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">SOC 2 Certified</span>
                    <p className="text-xs text-white/40">Enterprise security</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
