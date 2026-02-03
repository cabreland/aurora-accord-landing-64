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
import nextTierLogo from '@/assets/next-tier-logo.png';
import heroCircuitImage from '@/assets/hero-circuit.png';
import bgCircuitPattern from '@/assets/bg-circuit-pattern.png';
import bgCircuitCta from '@/assets/bg-circuit-cta.png';

const HomePageC = () => {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
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
      
      {/* Circuit pattern overlay - using generated asset for visual continuity */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${bgCircuitPattern})`,
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat'
        }}
      />
    </div>
  );
};

// Glass card component for consistent styling
const GlassCard = ({ children, className = "", highlight = false, ...props }: { children: React.ReactNode; className?: string; highlight?: boolean }) => (
  <div 
    className={`
      bg-[rgba(255,255,255,0.04)] 
      backdrop-blur-[30px] 
      border border-[rgba(255,255,255,0.08)] 
      rounded-2xl 
      ${highlight ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/10' : ''}
      hover:border-[rgba(212,175,55,0.3)] 
      transition-all duration-300
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
);

// Import premium header
import PremiumHeader from '@/components/homepage/PremiumHeader';

// Navigation - Using Premium Header
function Navigation() {
  return <PremiumHeader />;
}

// Hero Section - Premium Dark Theme with Image on Right Side
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0A0C10]" />
      
      {/* YOUR custom hero image - positioned on right half only */}
      <div className="absolute top-0 right-0 bottom-0 w-1/2 lg:w-[55%] overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroCircuitImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Left edge fade for seamless blend */}
        <div className="absolute inset-y-0 left-0 w-1/3 pointer-events-none" style={{ background: 'linear-gradient(to right, #0A0C10 0%, transparent 100%)' }} />
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #0A0C10 0%, transparent 100%)' }} />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, #0A0C10 0%, transparent 100%)' }} />
      </div>
      
      {/* Subtle gold glow */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#F4D77F]/10 to-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[30px] mb-8"
            >
              <Sparkles className="w-4 h-4 text-[#F4D77F]" />
              <span className="text-sm text-white/70 tracking-tight">Founder-First Exit Firm</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-[58px] font-bold text-white leading-[1.08] tracking-[-0.02em] mb-6" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
              Fast-Exit Acquisitions for{' '}
              <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
                Digital Founders
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-4 font-medium tracking-tight">
              We buy profitable digital businesses. Cash. 45-60 days.
            </p>
            
            <p className="text-lg text-white/50 mb-8 leading-relaxed max-w-lg tracking-tight">
              Next Tier Partners acquires digital businesses that are ready for professional ownership and strategic growth. If you've built a profitable SaaS, agency, or DTC brand and want a fast exit with certainty—we're your buyer.
            </p>

            <div className="space-y-3 mb-10">
              {[
                "Direct acquisitions—we're principals, not brokers",
                "45-60 day closings with cash payment",
                "$300K-$2.5M deals—serious capital for serious founders"
              ].map((item, i) => (
                <motion.p 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/60 tracking-tight"
                >
                  <span className="text-[#F4D77F]">→</span>
                  {item}
                </motion.p>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#F4D77F] text-[#0A0C10] font-semibold px-8 h-13 shadow-xl shadow-[#D4AF37]/25 transition-all duration-300 tracking-tight"
              >
                Start Your Exit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] px-6 h-13 transition-all duration-300 tracking-tight"
              >
                Learn More
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F4D77F]/30 to-[#D4AF37]/20 border-2 border-[#0A0C10] flex items-center justify-center backdrop-blur-sm"
                  >
                    <span className="text-xs font-medium text-white/70">{String.fromCharCode(64 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40 tracking-tight">
                Trusted by <span className="text-white/60 font-medium">100+</span> founders worldwide
              </p>
            </div>
          </motion.div>

          {/* Right side - Floating badges positioned over the background image */}
          <div className="relative hidden lg:block">
            {/* Floating Badge - Deal Closed */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute right-8 top-16 bg-[rgba(13,17,23,0.95)] backdrop-blur-[30px] rounded-xl shadow-xl px-4 py-3 border border-[rgba(255,255,255,0.08)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-white tracking-tight">Deal Closed</span>
                  <p className="text-xs text-white/40">$2.4M acquisition</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Badge - Licensed Broker */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute left-4 bottom-24 bg-[rgba(13,17,23,0.95)] backdrop-blur-[30px] rounded-xl shadow-xl px-4 py-3 border border-[rgba(255,255,255,0.08)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F4D77F]/20 to-[#D4AF37]/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#F4D77F]" />
                </div>
                <div>
                  <span className="text-sm font-medium text-white tracking-tight">Licensed Broker</span>
                  <p className="text-xs text-white/40">Full compliance</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Trust Strip - Refined
function TrustStrip() {
  return (
    <div className="border-y border-[rgba(255,255,255,0.06)] bg-[rgba(10,12,16,0.6)] backdrop-blur-[30px]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-3 text-sm text-white/50 tracking-tight">
          <Shield className="w-4 h-4 text-[#F4D77F]" />
          <span>Professional acquisition and exit facilitation — Fast, transparent, and confidential</span>
        </div>
      </div>
    </div>
  );
}

// What We Do Section
function WhatWeDo() {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D0F14] to-[#0A0C10]" />
      <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[#F4D77F]/6 to-[#D4AF37]/4 rounded-full blur-[180px] -translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[30px] mb-6">
            <Building2 className="w-4 h-4 text-[#F4D77F]" />
            <span className="text-sm text-white/70 tracking-tight">Our Business Model</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            Two Paths to Your{' '}
            <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
              Perfect Exit
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto tracking-tight">
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
          >
            <GlassCard className="p-8 h-full group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F4D77F]/15 to-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:from-[#F4D77F]/25 group-hover:to-[#D4AF37]/15 transition-colors">
                <Target className="w-7 h-7 text-[#F4D77F]" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                Strategic Acquisitions
              </h3>
              
              <p className="text-white/50 mb-6 tracking-tight">
                We acquire stable, cash-flowing digital businesses for optimization and long-term growth.
              </p>
              
              <ul className="space-y-3">
                {[
                  'Focus on SaaS, agencies, and e-commerce',
                  'Operational improvements and growth strategies',
                  'Portfolio approach with multiple holdings'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-[#F4D77F] mt-0.5 flex-shrink-0" />
                    <span className="text-sm tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
          
          {/* Path 2: Exit Facilitation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard highlight className="p-8 h-full group relative">
              <div className="absolute -top-3 right-8 bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] text-[#0A0C10] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Most Popular
              </div>
              
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F4D77F]/15 to-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:from-[#F4D77F]/25 group-hover:to-[#D4AF37]/15 transition-colors">
                <TrendingUp className="w-7 h-7 text-[#F4D77F]" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                Premium Exit Services
              </h3>
              
              <p className="text-white/50 mb-6 tracking-tight">
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
                    <span className="text-sm tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Why Next Tier - Comparison
function WhyNextTier() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0C10]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[180px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#F4D77F]/6 to-[#D4AF37]/4 rounded-full blur-[180px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
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
            className="rounded-2xl border border-red-500/20 bg-[rgba(255,255,255,0.02)] backdrop-blur-[30px] p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>Typical Buyers & Flippers</h3>
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
                  <span className="text-sm tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Next Tier Partners */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard highlight className="p-8 relative">
              <div className="absolute -top-3 right-8 bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] text-[#0A0C10] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Our Approach
              </div>
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-6 h-6 text-[#F4D77F]" />
                <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>Next Tier Partners</h3>
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
                    <span className="text-sm tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
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
    <section id="how-it-works" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D0F14] to-[#0A0C10]" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#F4D77F]/6 to-[#D4AF37]/4 rounded-full blur-[180px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[30px] mb-6">
            <Clock className="w-4 h-4 text-[#F4D77F]" />
            <span className="text-sm text-white/70 tracking-tight">45-Day Process</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            How the Process Works
          </h2>
          <p className="text-lg text-white/50 tracking-tight">
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
              <GlassCard className="p-6 h-full">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#F4D77F]/30 to-[#D4AF37]/20 bg-clip-text text-transparent mb-4">{step.number}</div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F4D77F]/15 to-[#D4AF37]/10 flex items-center justify-center mb-4 text-[#F4D77F] group-hover:from-[#F4D77F]/25 group-hover:to-[#D4AF37]/15 transition-colors">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed tracking-tight">{step.description}</p>
              </GlassCard>
              
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
    <section id="exit-paths" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0C10]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#F4D77F]/6 to-[#D4AF37]/4 rounded-full blur-[180px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            Choose Your{' '}
            <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
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
            >
              <GlassCard highlight={path.highlight} className="p-8 h-full hover:scale-[1.02] transition-transform duration-300">
                {path.highlight && (
                  <div className="inline-block bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] text-[#0A0C10] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>{path.title}</h3>
                <div className="bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] bg-clip-text text-transparent text-sm font-semibold mb-4">{path.subtitle}</div>
                <p className="text-white/50 leading-relaxed mb-6 tracking-tight">{path.description}</p>
                <Button 
                  className={`w-full ${
                    path.highlight 
                      ? 'bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#F4D77F] text-[#0A0C10]' 
                      : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] text-white'
                  } tracking-tight`}
                >
                  Learn More
                </Button>
              </GlassCard>
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
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D0F14] to-[#0A0C10]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#F4D77F]/6 to-[#D4AF37]/4 rounded-full blur-[180px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[30px] mb-6">
            <Users className="w-4 h-4 text-[#F4D77F]" />
            <span className="text-sm text-white/70 tracking-tight">Founder Stories</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
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
            >
              <GlassCard className="p-8 h-full">
                <p className="text-white/70 leading-relaxed mb-6 tracking-tight">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-white tracking-tight">{testimonial.author}</div>
                  <div className="bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] bg-clip-text text-transparent text-sm">{testimonial.business}</div>
                </div>
              </GlassCard>
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
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#F4D77F] to-[#D4AF37]"></div>
              <span className="tracking-tight">{item}</span>
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
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0C10]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            Who We Work With
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto tracking-tight">
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
              className="px-6 py-3 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[30px] text-white/70 text-sm hover:border-[#D4AF37]/30 hover:text-white transition-all duration-300 tracking-tight"
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
      answer: "For direct acquisitions, there are no seller-side fees. For brokered exits, we charge a standard success fee (a percentage of the sale price), only paid when the deal closes. We'll discuss specific terms during our initial consultation."
    }
  ];

  return (
    <section id="faq" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D0F14] to-[#0A0C10]" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#F4D77F]/5 to-[#D4AF37]/3 rounded-full blur-[180px] -translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            Frequently Asked Questions
          </h2>
        </motion.div>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <span className="font-semibold text-white tracking-tight">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[#F4D77F] transition-transform duration-200 ${
                      openIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === idx && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-white/60 leading-relaxed tracking-tight">{faq.answer}</p>
                  </motion.div>
                )}
              </GlassCard>
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
    <section className="py-28 relative overflow-hidden">
      {/* CTA circuit background - full immersive experience */}
      <div className="absolute inset-0 bg-[#0A0C10]" />
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `url(${bgCircuitCta})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10]/80 via-transparent to-[#0A0C10]/60" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[30px] mb-8">
            <Sparkles className="w-4 h-4 text-[#F4D77F]" />
            <span className="text-sm text-white/70 tracking-tight">Ready to Exit?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            Let's Discuss Your{' '}
            <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
              Exit Strategy
            </span>
          </h2>
          
          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto tracking-tight">
            Apply below for a confidential conversation. We'll assess your business, outline potential exit paths, and answer all your questions — no pressure, no commitment.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#F4D77F] text-[#0A0C10] font-semibold px-10 h-14 text-base shadow-2xl shadow-[#D4AF37]/30 transition-all duration-300 tracking-tight"
            >
              Get Your Free Valuation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] px-8 h-14 text-base transition-all duration-300 tracking-tight"
            >
              Talk to Our Team
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="tracking-tight">100% Confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="tracking-tight">No Obligation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="tracking-tight">Licensed Brokerage</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 border-t border-[rgba(255,255,255,0.06)] bg-[#0A0C10]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src={nextTierLogo} 
              alt="Next Tier Partners" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="flex items-center gap-8">
            <a href="#" className="text-white/50 hover:text-[#F4D77F] text-sm transition-colors tracking-tight">Privacy Policy</a>
            <a href="#" className="text-white/50 hover:text-[#F4D77F] text-sm transition-colors tracking-tight">Terms of Service</a>
            <a href="#" className="text-white/50 hover:text-[#F4D77F] text-sm transition-colors tracking-tight">Contact</a>
          </div>
          
          <p className="text-white/30 text-sm tracking-tight">
            © 2026 Next Tier Partners. All rights reserved.
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.04)]">
          <p className="text-center text-xs text-white/30 tracking-tight">
            All transactions facilitated through Exclusive Business Brokers (License info where applicable).
          </p>
        </div>
      </div>
    </footer>
  );
}

export default HomePageC;
