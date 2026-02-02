import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  ChevronDown,
  Play,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Target,
  Building2,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePageC = () => {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-white">
      <Navigation />
      <Hero />
      <TrustStrip />
      <WhatWeDo />
      <WhyNextTier />
      <Process />
      <ExitPaths />
      <ResultsTestimonials />
      <WhoWeWorkWith />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

// Navigation - Modern SaaS Style
function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B8962E] rounded-lg flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <span className="text-[#0A0C10] font-bold text-sm">NT</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Next Tier Partners</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium">How It Works</a>
            <a href="#exit-paths" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium">Exit Paths</a>
            <a href="#faq" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium">FAQ</a>
          </div>
          
          <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-[#0A0C10] font-semibold px-6 shadow-lg shadow-[#D4AF37]/20 transition-all duration-300">
            Apply Now
          </Button>
        </div>
      </div>
    </nav>
  );
}

// Hero Section - DealFlow Style
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Refined Background */}
      <div className="absolute inset-0 bg-[#0A0C10]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0C10] via-[#111318] to-[#0A0C10]" />
        
        {/* Gold accent glow - top left */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        
        {/* Blue accent glow - bottom right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4" />
        
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[180px] -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
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
              <span className="text-sm text-white/70">Founder-First Exit Firm</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-white leading-[1.1] tracking-tight mb-6">
              We Buy & Sell Digital Businesses in{' '}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
                45-60 Days
              </span>
            </h1>
            
            <p className="text-lg text-white/50 mb-8 leading-relaxed max-w-lg">
              Strategic acquisitions and premium exits for SaaS, agencies, and DTC brands. Fast, professional transactions with complete transparency.
            </p>

            <div className="space-y-3 mb-10">
              {[
                'We acquire digital businesses for optimization and growth',
                'Or facilitate premium exits to qualified buyers in our network',
                'Fast, professional transactions in 45-60 days'
              ].map((item, i) => (
                <motion.p 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/60"
                >
                  <span className="text-[#D4AF37]">→</span>
                  {item}
                </motion.p>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-[#0A0C10] font-semibold px-8 h-13 shadow-lg shadow-[#D4AF37]/20 transition-all duration-300"
              >
                Get Your Business Valued
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/[0.1] bg-white/[0.02] text-white hover:bg-white/[0.05] hover:border-white/[0.15] px-6 h-13 transition-all duration-300"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
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
                Trusted by <span className="text-white/60 font-medium">100+</span> founders worldwide
              </p>
            </div>
          </motion.div>

          {/* Right - Stats Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-blue-500/10 rounded-3xl blur-2xl transform scale-105" />
            
            <div className="relative bg-[#0D1117]/80 backdrop-blur-xl rounded-2xl p-1 shadow-2xl border border-white/[0.08]">
              <div className="bg-[#0A0C10] rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#0D1117] border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  <span className="ml-3 text-xs text-white/30">Exit Dashboard</span>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-[#D4AF37]">45</div>
                      <div className="text-xs text-white/40 mt-1">Day Timeline</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-emerald-400">$15M+</div>
                      <div className="text-xs text-white/40 mt-1">Closed Deals</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-blue-400">100%</div>
                      <div className="text-xs text-white/40 mt-1">Confidential</div>
                    </div>
                  </div>

                  {/* Progress Visualization */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-white/60">Deal Progress</span>
                      <span className="text-xs text-[#D4AF37]">45 Days to Close</span>
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
                      <span className="text-xs text-white/60 flex-1">LOI signed - SaaS Co</span>
                      <span className="text-xs text-white/30">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                      <span className="text-xs text-white/60 flex-1">Due diligence complete</span>
                      <span className="text-xs text-white/30">1d ago</span>
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
                    <span className="text-sm font-medium text-white">Licensed Broker</span>
                    <p className="text-xs text-white/40">Full compliance</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Trust Strip - Refined
function TrustStrip() {
  return (
    <div className="border-y border-white/[0.06] bg-[#0A0C10]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-3 text-sm text-white/50">
          <Shield className="w-4 h-4 text-[#D4AF37]" />
          <span>Professional acquisition and exit facilitation — Fast, transparent, and confidential</span>
        </div>
      </div>
    </div>
  );
}

// What We Do Section
function WhatWeDo() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D1117] to-[#0A0C10]" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-white/70">Our Business Model</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Two Paths to Your{' '}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
              Perfect Exit
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            We operate as both strategic buyers and exit facilitators for digital businesses
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Path 1: Acquisition */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 hover:border-[#D4AF37]/30 hover:bg-white/[0.04] transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
              <Target className="w-7 h-7 text-[#D4AF37]" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Strategic Acquisitions
            </h3>
            
            <p className="text-white/50 mb-6">
              We acquire stable, cash-flowing digital businesses for optimization and long-term growth.
            </p>
            
            <ul className="space-y-3">
              {[
                'Focus on SaaS, agencies, and e-commerce',
                'Operational improvements and growth strategies',
                'Portfolio approach with multiple holdings'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/60">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Path 2: Exit Facilitation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group bg-white/[0.02] border border-[#D4AF37]/30 rounded-2xl p-8 hover:bg-white/[0.04] transition-all duration-300 relative"
          >
            <div className="absolute -top-3 right-8 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Most Popular
            </div>
            
            <div className="w-14 h-14 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
              <TrendingUp className="w-7 h-7 text-[#D4AF37]" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Premium Exit Services
            </h3>
            
            <p className="text-white/50 mb-6">
              Not ready to sell to us? We facilitate premium exits to qualified buyers in our network.
            </p>
            
            <ul className="space-y-3">
              {[
                'Curated buyer network of strategic acquirers',
                'Confidential deal structuring and negotiation',
                'Full transaction support from LOI to close'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Why Next Tier - Comparison
function WhyNextTier() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0C10]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Why Next Tier Partners vs{' '}
            <span className="text-white/40">Typical Buyers</span>
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Typical Buyers */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-red-500/20 bg-white/[0.02] backdrop-blur p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">Typical Buyers & Flippers</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Lowball offers and aggressive negotiation",
                "No licensing or regulatory compliance",
                "Opaque process with hidden fees",
                "Slow timelines stretching 6–12+ months",
                "No post-exit support options",
                "High pressure and founder burnout"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-white/50">
                  <XCircle className="w-4 h-4 text-red-400/60 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Next Tier Partners */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border-2 border-[#D4AF37]/40 bg-white/[0.03] backdrop-blur p-8 relative"
          >
            <div className="absolute -top-3 right-8 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Our Approach
            </div>
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
              <h3 className="text-xl font-bold text-white">Next Tier Partners</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Strategic acquisitions and premium exits",
                "Founder-first approach with fair valuations",
                "45-60 day transaction timelines",
                "Transparent deal structure with clear pricing",
                "Multiple exit paths tailored to your goals",
                "Post-exit partnership and growth options"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Process Section
function Process() {
  const steps = [
    {
      number: "01",
      icon: <Zap className="w-6 h-6" />,
      title: "Apply",
      description: "Share your business details and exit goals through our confidential application."
    },
    {
      number: "02",
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Valuation & Exit Plan",
      description: "We analyze your business and map the optimal path based on your objectives."
    },
    {
      number: "03",
      icon: <Target className="w-6 h-6" />,
      title: "Exit Path Selection",
      description: "Choose to sell via brokerage, direct acquisition, or scale before exit."
    },
    {
      number: "04",
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Close & Next Chapter",
      description: "Complete the transaction and step confidently into your next venture."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D1117] to-[#0A0C10]" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-white/70">45-Day Process</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How the Process Works
          </h2>
          <p className="text-lg text-white/50">
            Clear, professional guidance from first call to close.
          </p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative group"
            >
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 hover:border-[#D4AF37]/30 hover:bg-white/[0.04] transition-all duration-300 h-full">
                <div className="text-5xl font-bold text-[#D4AF37]/20 mb-4">{step.number}</div>
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-4 text-[#D4AF37] group-hover:bg-[#D4AF37]/20 transition-colors">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              </div>
              
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#D4AF37]/40 to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Exit Paths
function ExitPaths() {
  const paths = [
    {
      title: "Sell My Business",
      subtitle: "Premium Exit Facilitation",
      description: "We connect you with qualified buyers from our network and manage the entire transaction process.",
      highlight: true
    },
    {
      title: "Get Acquired Directly",
      subtitle: "We Buy",
      description: "For the right businesses, we step in as the buyer with a clean, professional acquisition process.",
      highlight: false
    },
    {
      title: "Scale Before I Exit",
      subtitle: "Growth Partnership",
      description: "Use our growth systems to increase valuation before you sell for maximum return.",
      highlight: false
    }
  ];

  return (
    <section id="exit-paths" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0C10]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
              Exit Path
            </span>
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {paths.map((path, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-2xl border p-8 hover:scale-[1.02] transition-all duration-300 ${
                path.highlight 
                  ? 'border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/10 to-transparent shadow-lg shadow-[#D4AF37]/10' 
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-[#D4AF37]/30'
              }`}
            >
              {path.highlight && (
                <div className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{path.title}</h3>
              <div className="text-[#D4AF37] text-sm font-semibold mb-4">{path.subtitle}</div>
              <p className="text-white/50 leading-relaxed mb-6">{path.description}</p>
              <Button 
                className={`w-full ${
                  path.highlight 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-[#0A0C10]' 
                    : 'bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-white'
                }`}
              >
                Learn More
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Results & Testimonials
function ResultsTestimonials() {
  const testimonials = [
    {
      quote: "Next Tier Partners handled everything professionally. The 45-day timeline was accurate, and I felt protected throughout.",
      author: "Michael R.",
      business: "Performance Marketing Agency"
    },
    {
      quote: "I appreciated the transparency and licensing. It made the exit feel legitimate and safe.",
      author: "Sarah T.",
      business: "SaaS Product"
    },
    {
      quote: "They gave me options I didn't know existed. We scaled first, then exited at a much higher valuation.",
      author: "James K.",
      business: "Content Media Property"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D1117] to-[#0A0C10]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-white/70">Founder Stories</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            What Founders Say
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 hover:border-[#D4AF37]/30 transition-all duration-300"
            >
              <p className="text-white/70 leading-relaxed mb-6">"{testimonial.quote}"</p>
              <div>
                <div className="font-bold text-white">{testimonial.author}</div>
                <div className="text-[#D4AF37] text-sm">{testimonial.business}</div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-8 text-sm text-white/40 flex-wrap">
          {[
            'Avg. timeline: 45 days',
            'Licensed transactions via EBB',
            'Digital-only focus'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Who We Work With
function WhoWeWorkWith() {
  const businessTypes = [
    "Digital Agencies",
    "Performance Marketing Shops",
    "SaaS Products",
    "Software Products",
    "Online Service Businesses",
    "Content & Media Properties",
    "E-commerce Brands",
    "Subscription Businesses"
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0C10]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Who We Work With
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Digital founders who are serious about a professional exit or scale path.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
        >
          {businessTypes.map((type, idx) => (
            <div 
              key={idx} 
              className="px-6 py-3 rounded-full bg-white/[0.02] border border-white/[0.08] text-white/70 text-sm hover:border-[#D4AF37]/30 hover:text-white transition-all duration-300"
            >
              {type}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "What deal sizes do you work with?",
      answer: "We typically work with digital businesses generating $500K–$10M in annual revenue. However, we review each opportunity individually based on growth potential, business model, and strategic fit."
    },
    {
      question: "How does the 45-day target work?",
      answer: "The 45-day timeline begins after we complete initial due diligence and valuation. It covers buyer outreach, negotiation, and closing. Some deals close faster, others may take slightly longer depending on complexity."
    },
    {
      question: "How are you different from a typical broker or buyer?",
      answer: "We operate as both a licensed brokerage (through Exclusive Business Brokers) and a strategic acquirer. This gives founders multiple exit paths and ensures every transaction is compliant, professional, and founder-focused."
    },
    {
      question: "How does confidentiality work?",
      answer: "All initial conversations are confidential. When we market your business through our brokerage arm, we use blind profiles and NDAs. Your identity is only revealed to qualified, serious buyers you approve."
    },
    {
      question: "What fees should I expect?",
      answer: "Brokerage fees are success-based and disclosed upfront during valuation. Direct acquisitions have no brokerage fees. We never charge upfront fees or retainers."
    }
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D1117] to-[#0A0C10]" />
      
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-semibold text-white pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-[#D4AF37] flex-shrink-0 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6">
                  <p className="text-white/50 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA
function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0C10]" />
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[180px] -translate-x-1/2 -translate-y-1/2" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Next Chapter{' '}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
              Starts Here
            </span>
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Share your business and we'll map a clear, professional exit or scale path in under 45 days.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-[#0A0C10] font-semibold px-12 h-14 text-lg shadow-2xl shadow-[#D4AF37]/30 transition-all duration-300"
          >
            Apply for a 45-Day Exit Plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-white/40 text-sm mt-4">
            No obligation. Strictly confidential.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-[#0A0C10] border-t border-white/[0.06] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B8962E] rounded-lg flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                <span className="text-[#0A0C10] font-bold text-sm">NT</span>
              </div>
              <span className="text-white font-bold">Next Tier Partners</span>
            </div>
            <p className="text-white/40 text-sm">Strategic acquisitions and premium exits for digital businesses</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Process</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Case Studies</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Exit Guide</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/[0.06] pt-8">
          <p className="text-white/30 text-sm text-center">
            &copy; 2024 Next Tier Partners. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default HomePageC;
