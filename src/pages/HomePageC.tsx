import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Lock, LineChart, Handshake, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePageC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020819] to-[#02091b] text-white relative overflow-hidden">
      {/* Subtle background noise */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]/50 pointer-events-none" />
      
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

// Navigation
function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">NT</span>
            </div>
            <span className="text-white/95 font-semibold text-lg tracking-tight">Next Tier Partners</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors text-sm">How It Works</a>
            <a href="#exit-paths" className="text-slate-300 hover:text-white transition-colors text-sm">Exit Paths</a>
            <a href="#faq" className="text-slate-300 hover:text-white transition-colors text-sm">FAQ</a>
          </div>
          
          <Button className="bg-blue-600 text-white hover:bg-blue-500 font-medium shadow-[0_0_40px_rgba(37,99,235,0.35)] hover:shadow-[0_0_50px_rgba(37,99,235,0.45)] transition-all duration-200 hover:scale-[1.02]">
            Apply Now
          </Button>
        </div>
      </div>
    </nav>
  );
}

// Hero Section
function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Soft blue glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
              <span className="text-slate-200 text-sm font-medium">Founder-First Exit Firm</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-semibold text-white/95 tracking-tight leading-[1.1]">
              The Modern Path to a Fast, Professional Business Exit
            </h1>
            
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-xl">
              Sell your digital business in 45 days or less. Licensed, confidential, founder-first. Backed by Exclusive Business Brokers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-500 font-medium shadow-[0_0_40px_rgba(37,99,235,0.35)] hover:shadow-[0_0_50px_rgba(37,99,235,0.45)] transition-all duration-200 hover:scale-[1.02]">
                Apply for a 45-Day Exit Plan
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-slate-100 hover:bg-white/5 hover:border-white/40 transition-all duration-200">
                See how the process works →
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Soft blue glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent blur-3xl" />
            
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_18px_45px_rgba(15,23,42,0.65)] hover:-translate-y-1 hover:border-white/20 transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-sm text-slate-300">Exit Valuation Range</span>
                  <span className="text-2xl font-semibold text-white/95">$2.4M - $3.1M</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-sm text-slate-300">Target Days to Close</span>
                  <span className="text-2xl font-semibold text-blue-400">45 Days</span>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-slate-300 mb-2">Exit Path Options</div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-blue-500/30 hover:bg-white/8 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-white/95">Brokered Sale</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-200">Direct Acquisition</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-200">Scale Before Exit</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Trust Strip
function TrustStrip() {
  return (
    <section className="py-6 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-3 text-slate-300">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="text-sm md:text-base">
            Backed by Exclusive Business Brokers — licensed, compliant, confidential transactions
          </span>
        </div>
      </div>
    </section>
  );
}

// What We Do Section
function WhatWeDo() {
  const pillars = [
    {
      icon: Zap,
      title: "Exit Fast",
      description: "Sell your digital business in ~45 days through our buyer network and brokerage infrastructure."
    },
    {
      icon: Lock,
      title: "Exit Safely",
      description: "Licensed, compliant, confidential transactions handled by Exclusive Business Brokers."
    },
    {
      icon: LineChart,
      title: "Scale Before Exit",
      description: "Use AI-driven growth & automation to increase valuation before going to market."
    },
    {
      icon: Handshake,
      title: "Post-Exit Partnerships",
      description: "Partner with us on your next venture using our growth infrastructure."
    }
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white/95 mb-4 tracking-tight">
            What We Do for Modern Founders
          </h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            We handle exits, growth, and post-exit partnerships for digital businesses.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group shadow-[0_18px_45px_rgba(15,23,42,0.65)]"
            >
              <pillar.icon className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="text-xl font-semibold text-white/95 mb-3">{pillar.title}</h3>
              <p className="text-slate-200 leading-relaxed mb-4 text-sm">{pillar.description}</p>
              <a href="#" className="text-blue-400 text-sm font-medium flex items-center space-x-1 hover:space-x-2 transition-all duration-200">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Why Next Tier - Comparison
function WhyNextTier() {
  return (
    <section className="py-20 md:py-28 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white/95 mb-4 tracking-tight">
            Why Next Tier Partners vs Typical Buyers
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Typical Buyers */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_18px_45px_rgba(15,23,42,0.65)]"
          >
            <h3 className="text-2xl font-semibold text-white/90 mb-6">Typical Buyers & Flippers</h3>
            <ul className="space-y-4">
              {[
                "Lowball offers with hidden terms",
                "No licensing or regulatory oversight",
                "Opaque process and slow timelines",
                "No post-exit support or guidance",
                "Pressure tactics and rushed decisions"
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="text-red-400/70 mt-1 text-lg">×</span>
                  <span className="text-slate-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Next Tier Partners */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-600/10 to-transparent backdrop-blur-md border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_18px_45px_rgba(15,23,42,0.65)] hover:border-blue-400/40 transition-colors duration-300"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500" />
            <h3 className="text-2xl font-semibold text-white/95 mb-6">Next Tier Partners</h3>
            <ul className="space-y-4">
              {[
                "Fair valuations with transparent methodology",
                "Licensed via Exclusive Business Brokers",
                "45-day target with clear milestones",
                "Multiple exit paths to choose from",
                "Post-exit partnership opportunities"
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/95 text-sm">{item}</span>
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
      title: "Apply",
      description: "Share your business and exit goals."
    },
    {
      number: "02",
      title: "Valuation & Exit Plan",
      description: "We run numbers and map the best path."
    },
    {
      number: "03",
      title: "Exit Path Selection",
      description: "Choose: sell via brokerage, direct acquisition, or scale before exit."
    },
    {
      number: "04",
      title: "Close & Next Chapter",
      description: "Close the transaction and step into your next play."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white/95 mb-4 tracking-tight">
            How the Process Works
          </h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            From first call to close, we provide clarity and speed at every step.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.65)] hover:bg-slate-900/80 hover:border-white/20 transition-all duration-300">
                <div className="text-3xl font-medium text-blue-400 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-white/95 mb-3">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{step.description}</p>
              </div>
              {index < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-500/20" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#" className="text-slate-300 hover:text-white text-sm font-medium inline-flex items-center space-x-2 transition-colors">
            <span>View a sample 45-day timeline</span>
            <ArrowRight className="w-4 h-4" />
          </a>
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
      subtitle: "Brokered Exit",
      description: "Work with our licensed brokerage arm to market, negotiate, and close your sale.",
      highlighted: true
    },
    {
      title: "Get Acquired Directly",
      subtitle: "We Buy",
      description: "For the right businesses, we come in as the buyer with a clean, professional process.",
      highlighted: false
    },
    {
      title: "Scale Before I Exit",
      subtitle: "Growth Partnership",
      description: "Use our AI-driven growth systems to increase valuation before you sell.",
      highlighted: false
    }
  ];

  return (
    <section id="exit-paths" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white/95 mb-4 tracking-tight">
            Choose the Path That Protects Your Time and Value
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {paths.map((path, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`rounded-2xl p-8 ${
                path.highlighted
                  ? 'bg-gradient-to-br from-blue-600/10 to-transparent border-2 border-blue-500/40 shadow-[0_0_50px_rgba(37,99,235,0.2)]'
                  : 'bg-white/5 backdrop-blur-md border border-white/10'
              } hover:-translate-y-1 transition-all duration-300 shadow-[0_18px_45px_rgba(15,23,42,0.65)]`}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-white/95 mb-2">{path.title}</h3>
                <p className={`font-medium ${path.highlighted ? 'text-blue-400' : 'text-slate-300'}`}>{path.subtitle}</p>
              </div>
              <p className="text-slate-200 leading-relaxed text-sm mb-6">{path.description}</p>
              <Button
                className={`w-full ${
                  path.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/20'
                } transition-all duration-200 hover:scale-[1.02]`}
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
      quote: "The process was transparent, professional, and fast. I felt protected every step of the way.",
      author: "Alex Chen",
      business: "Performance Marketing Agency",
      initial: "AC"
    },
    {
      quote: "Next Tier helped me understand my options clearly. No pressure, just clarity and professionalism.",
      author: "Sarah Mitchell",
      business: "SaaS Product",
      initial: "SM"
    },
    {
      quote: "I closed in 42 days. The licensed brokerage backing gave me confidence throughout.",
      author: "James Rodriguez",
      business: "Content Business",
      initial: "JR"
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white/95 mb-4 tracking-tight">
            What Founders Say After Working With Us
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.65)] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
            >
              <p className="text-slate-200 mb-6 italic leading-relaxed text-sm">"{testimonial.quote}"</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium text-sm">
                  {testimonial.initial}
                </div>
                <div>
                  <p className="font-semibold text-white/95">{testimonial.author}</p>
                  <p className="text-xs text-slate-300">{testimonial.business}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-12 text-center"
        >
          <div>
            <div className="text-3xl font-semibold text-white/95">45 Days</div>
            <div className="text-sm text-slate-300 mt-1">Avg. Timeline Target</div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <div className="text-3xl font-semibold text-white/95">Licensed</div>
            <div className="text-sm text-slate-300 mt-1">Via Exclusive Business Brokers</div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <div className="text-3xl font-semibold text-white/95">Digital Only</div>
            <div className="text-sm text-slate-300 mt-1">Focused Expertise</div>
          </div>
        </motion.div>
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
    "Software Development",
    "Online Service Businesses",
    "Content & Media Properties",
    "E-commerce Brands",
    "Developer Tools"
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white/95 mb-4 tracking-tight">
            Who We Work With
          </h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Digital founders who are serious about a professional exit or scale path.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {businessTypes.map((category, index) => (
            <div
              key={index}
              className="px-6 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-slate-200 text-sm hover:bg-white/10 hover:border-white/30 transition-all duration-200 hover:scale-[1.02]"
            >
              {category}
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
      answer: "We typically work with digital businesses valued between $500K and $10M, though we evaluate each opportunity individually based on the business model and growth potential."
    },
    {
      question: "How does the 45-day target work?",
      answer: "Our 45-day timeline is a target based on having all documentation ready and working with motivated buyers. The actual timeline can vary based on deal complexity, but we structure our process to move as quickly as possible while maintaining thoroughness."
    },
    {
      question: "How are you different from a typical broker or buyer?",
      answer: "We offer multiple exit paths (brokered sale, direct acquisition, or scale before exit), we're backed by a licensed brokerage (Exclusive Business Brokers), and we focus exclusively on digital businesses. We're founder-first, meaning we prioritize your goals and timeline."
    },
    {
      question: "How does confidentiality work?",
      answer: "All potential buyers sign NDAs before receiving any identifying information about your business. We use anonymous teasers initially and only reveal details to pre-qualified, serious buyers. Your confidentiality is protected at every step."
    },
    {
      question: "What fees should I expect?",
      answer: "Fee structures vary based on the exit path chosen. For brokered sales, we use industry-standard success fees (typically 10-15% on a sliding scale). For direct acquisitions, there are no broker fees. We're transparent about all costs upfront."
    },
    {
      question: "What's the difference between Next Tier Partners and Exclusive Business Brokers?",
      answer: "Next Tier Partners is the founder-facing brand focused on modern digital businesses and multiple exit paths. Exclusive Business Brokers is our licensed brokerage arm that handles the regulatory and transactional aspects of sales. Together, we provide both the modern experience founders expect and the licensed infrastructure that protects all parties."
    }
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white/95 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-6 hover:bg-white/[0.07] transition-colors overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="font-medium text-white/95 hover:no-underline pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-300 flex-shrink-0 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === idx && (
                <div className="pb-4 pt-2">
                  <p className="text-slate-300 leading-relaxed text-sm">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA
function FinalCTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-semibold text-white/95 mb-6 tracking-tight">
          Your Next Chapter Starts Here
        </h2>
        <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          Share your business and we'll map a clear, professional exit or scale path in under 45 days.
        </p>
        <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-500 font-medium text-lg px-10 shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] transition-all duration-200 hover:scale-[1.02]">
          Apply for a 45-Day Exit Plan
        </Button>
        <p className="text-sm text-slate-400 mt-6">
          No obligation. Strictly confidential.
        </p>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 bg-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg shadow-blue-500/20" />
              <span className="text-lg font-semibold text-white/95">Next Tier Partners</span>
            </div>
            <p className="text-sm text-slate-300">
              Professional exits for modern founders.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white/95 mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Process</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Exit Paths</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white/95 mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white/95 mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Disclosures</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 Next Tier Partners. All rights reserved. Licensed transactions via Exclusive Business Brokers.</p>
        </div>
      </div>
    </footer>
  );
}

export default HomePageC;