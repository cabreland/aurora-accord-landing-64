import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Scale, Handshake, ArrowRight, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePageC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
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
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#C19A47] to-[#A67D2E] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">NT</span>
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight">Next Tier Partners</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-[#CCCCCC] hover:text-[#C19A47] transition-colors text-sm">How It Works</a>
            <a href="#exit-paths" className="text-[#CCCCCC] hover:text-[#C19A47] transition-colors text-sm">Exit Paths</a>
            <a href="#faq" className="text-[#CCCCCC] hover:text-[#C19A47] transition-colors text-sm">FAQ</a>
          </div>
          
          <Button className="bg-[#C19A47] hover:bg-[#D4AF5F] text-black font-semibold rounded-full px-6 shadow-lg shadow-[#C19A47]/20">
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
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Solid gradient background - no grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1A1A1A]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent border border-[#C19A47] mb-6">
              <span className="text-[#C19A47] text-xs font-semibold tracking-wide uppercase">Founder-First Exit Firm</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              We Buy & Sell Digital Businesses in 45-60 Days
            </h1>
            
            <p className="text-xl md:text-2xl text-[#CCCCCC] font-light mb-8">
              Strategic acquisitions and premium exits for SaaS, agencies, and DTC brands
            </p>
            
            <div className="space-y-3 mb-8 text-lg text-[#CCCCCC]">
              <p className="flex items-center gap-3">
                <span className="text-[#C19A47]">→</span>
                We acquire digital businesses for optimization and growth
              </p>
              <p className="flex items-center gap-3">
                <span className="text-[#C19A47]">→</span>
                Or facilitate premium exits to qualified buyers in our network
              </p>
              <p className="flex items-center gap-3">
                <span className="text-[#C19A47]">→</span>
                Fast, professional transactions in 45-60 days
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#C19A47] hover:bg-[#D4AF5F] text-black font-semibold rounded-full px-8 py-6 text-base shadow-2xl shadow-[#A67D2E]/40">
                Get Your Business Valued
              </Button>
              <a href="#acquisitions" className="flex items-center justify-center gap-2 text-[#C19A47] hover:text-[#D4AF5F] transition-colors text-base font-medium">
                See Recent Acquisitions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Right Column - Video */}
          <div className="relative">
            {/* Video Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#C19A47] shadow-2xl bg-black">
              
              {/* Replace src with your video URL */}
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Optional: Thumbnail overlay with play button (remove if video autoplays) */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/80 flex items-center justify-center group cursor-pointer hover:from-black/40 hover:to-black/70 transition">
                <div className="w-24 h-24 rounded-full bg-[#C19A47] flex items-center justify-center group-hover:scale-110 transition shadow-2xl">
                  <svg className="w-10 h-10 text-black ml-2" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 3l10 6-10 6V3z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Video Caption */}
            <div className="mt-6 text-center">
              <p className="text-[#C19A47] font-semibold">Watch: Our Acquisition Process</p>
              <p className="text-[#999999] text-sm mt-1">See how we structure deals in 45-60 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Trust Strip
function TrustStrip() {
  return (
    <div className="border-y border-[#2D2D2D] bg-black/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center gap-3 text-sm text-[#999999]">
          <Shield className="w-4 h-4 text-[#C19A47]" />
          <span>Professional acquisition and exit facilitation — Fast, transparent, and confidential</span>
        </div>
      </div>
    </div>
  );
}

// What We Do Section - Now "Our Business Model"
function WhatWeDo() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Our Business Model
          </h2>
          <p className="text-xl text-[#666666] max-w-3xl mx-auto">
            We operate as both strategic buyers and exit facilitators for digital businesses
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Path 1: Acquisition */}
          <div className="bg-[#0A0A0A] border-2 border-[#C19A47] rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-[#C19A47]/20 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#C19A47]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Strategic Acquisitions
            </h3>
            
            <p className="text-[#CCCCCC] mb-6">
              We acquire stable, cash-flowing digital businesses for optimization and long-term growth or quick arbitrage opportunities.
            </p>
            
            <ul className="space-y-3 text-[#CCCCCC]">
              <li className="flex items-start gap-3">
                <span className="text-[#C19A47] mt-1">✓</span>
                <span>Focus on SaaS, agencies, and e-commerce</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C19A47] mt-1">✓</span>
                <span>Operational improvements and growth strategies</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C19A47] mt-1">✓</span>
                <span>Portfolio approach with multiple holdings</span>
              </li>
            </ul>
          </div>
          
          {/* Path 2: Exit Facilitation */}
          <div className="bg-[#0A0A0A] border-2 border-[#C19A47] rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-[#C19A47]/20 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#C19A47]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Premium Exit Services
            </h3>
            
            <p className="text-[#CCCCCC] mb-6">
              Not ready to sell to us? We facilitate premium exits to qualified buyers in our extensive network.
            </p>
            
            <ul className="space-y-3 text-[#CCCCCC]">
              <li className="flex items-start gap-3">
                <span className="text-[#C19A47] mt-1">✓</span>
                <span>Curated buyer network of strategic acquirers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C19A47] mt-1">✓</span>
                <span>Confidential deal structuring and negotiation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C19A47] mt-1">✓</span>
                <span>Full transaction support from LOI to close</span>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </section>
  );
}

// Why Next Tier - Comparison
function WhyNextTier() {
  return (
    <section className="py-16 md:py-24 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Why Next Tier Partners vs Typical Buyers
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Typical Buyers */}
          <div className="rounded-2xl border border-red-500/20 bg-black/20 backdrop-blur p-8">
            <div className="flex items-center gap-2 mb-6">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-2xl font-bold">Typical Buyers & Flippers</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Lowball offers and aggressive negotiation tactics",
                "No licensing or regulatory compliance",
                "Opaque process with hidden fees",
                "Slow timelines stretching 6–12+ months",
                "No post-exit support or partnership options",
                "High pressure and founder burnout"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[#94a3b8]">
                  <XCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Next Tier Partners */}
          <div className="rounded-2xl border-2 border-[#C19A47] bg-black/40 backdrop-blur p-8 relative">
            <div className="absolute -top-3 right-8 bg-[#C19A47] text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Our Approach
            </div>
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-[#C19A47]" />
              <h3 className="text-2xl font-bold">Next Tier Partners</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Strategic acquisitions and premium exit facilitation",
                "Founder-first approach with fair market valuations",
                "45-60 day transaction timelines",
                "Transparent deal structure with clear pricing",
                "Multiple exit paths tailored to your goals",
                "Post-exit partnership and growth options"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] mt-1 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
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
      description: "Share your business details and exit goals through our confidential application."
    },
    {
      number: "02",
      title: "Valuation & Exit Plan",
      description: "We analyze your business and map the optimal path forward based on your objectives."
    },
    {
      number: "03",
      title: "Exit Path Selection",
      description: "Choose to sell via brokerage, direct acquisition, or scale before exit."
    },
    {
      number: "04",
      title: "Close & Next Chapter",
      description: "Complete the transaction and step confidently into your next venture."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#020617] mb-4">
            How the Process Works
          </h2>
          <p className="text-[#64748b] text-lg">
            Clear, professional guidance from first call to close.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="text-6xl font-extrabold text-[#fbbf24]/20 mb-4">{step.number}</div>
              <h3 className="text-xl font-bold text-[#020617] mb-3">{step.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{step.description}</p>
              
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#fbbf24] to-transparent"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="#" className="text-[#64748b] text-sm hover:text-[#020617] transition-colors inline-flex items-center gap-2">
            View a sample 45-day timeline <ArrowRight className="w-4 h-4" />
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
      description: "Use our AI-driven growth systems to increase valuation before you sell for maximum return.",
      highlight: false
    }
  ];

  return (
    <section id="exit-paths" className="py-16 md:py-24 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Choose the Path That Protects Your Time and Value
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {paths.map((path, idx) => (
            <div 
              key={idx} 
              className={`rounded-2xl border p-8 hover:scale-105 transition-all duration-300 ${
                path.highlight 
                  ? 'border-[#fbbf24] bg-gradient-to-br from-[#fbbf24]/10 to-black/40 shadow-lg shadow-[#fbbf24]/20' 
                  : 'border-white/10 bg-black/40 hover:border-[#fbbf24]/30'
              }`}
            >
              {path.highlight && (
                <div className="inline-block bg-[#fbbf24] text-[#020617] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{path.title}</h3>
              <div className="text-[#fbbf24] text-sm font-semibold mb-4">{path.subtitle}</div>
              <p className="text-[#94a3b8] leading-relaxed">{path.description}</p>
              <Button 
                variant={path.highlight ? "default" : "outline"} 
                className={`w-full mt-6 rounded-full ${
                  path.highlight 
                    ? 'bg-[#fbbf24] hover:bg-[#eab308] text-[#020617]' 
                    : 'border-white/20 hover:border-[#fbbf24]/50'
                }`}
              >
                Learn More
              </Button>
            </div>
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
      quote: "Next Tier Partners handled everything professionally. The 45-day timeline was accurate, and I felt protected throughout the entire process.",
      author: "Michael R.",
      business: "Performance Marketing Agency"
    },
    {
      quote: "I appreciated the transparency and licensing through Exclusive Business Brokers. It made the exit feel legitimate and safe.",
      author: "Sarah T.",
      business: "SaaS Product"
    },
    {
      quote: "They gave me options I did not know existed. We scaled first, then exited at a much higher valuation. Smart approach.",
      author: "James K.",
      business: "Content Media Property"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#020617] mb-4">
            What Founders Say After Working With Us
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
              <p className="text-[#1f2933] leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <div className="font-bold text-[#020617]">{testimonial.author}</div>
                <div className="text-[#64748b] text-sm">{testimonial.business}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-8 text-sm text-[#64748b] flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
            <span>Avg. timeline target: 45 days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
            <span>Licensed transactions via EBB</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
            <span>Digital-only focus</span>
          </div>
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
    <section className="py-16 md:py-24 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Who We Work With
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Digital founders who are serious about a professional exit or scale path.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {businessTypes.map((type, idx) => (
            <div key={idx} className="px-6 py-3 rounded-full bg-black/40 border border-white/10 text-[#f9fafb] text-sm backdrop-blur">
              {type}
            </div>
          ))}
        </div>
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
    },
    {
      question: "What is the difference between Next Tier Partners and Exclusive Business Brokers?",
      answer: "Next Tier Partners is the operating brand focused on founder relationships and strategic exits. Exclusive Business Brokers is our licensed brokerage entity that handles regulated transaction components and ensures legal compliance."
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#f9fafb]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#020617] mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-bold text-[#020617] pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-[#64748b] flex-shrink-0 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6">
                  <p className="text-[#64748b] leading-relaxed">{faq.answer}</p>
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
    <section className="py-20 md:py-32 bg-gradient-to-br from-[#020617] via-[#020617] to-[#111827] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(to right, #fbbf24 1px, transparent 1px), linear-gradient(to bottom, #fbbf24 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }}></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Your Next Chapter Starts Here
        </h2>
        <p className="text-[#94a3b8] text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Share your business and we will map a clear, professional exit or scale path in under 45 days.
        </p>
        <Button className="bg-[#fbbf24] hover:bg-[#eab308] text-[#020617] font-semibold rounded-full px-12 py-6 text-lg mb-4">
          Apply for a 45-Day Exit Plan
        </Button>
        <p className="text-[#64748b] text-sm">
          No obligation. Strictly confidential.
        </p>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-black border-t border-[#2D2D2D] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#C19A47] to-[#A67D2E] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">NT</span>
              </div>
              <span className="text-white font-bold">Next Tier Partners</span>
            </div>
            <p className="text-[#999999] text-sm">Strategic acquisitions and premium exits for digital businesses</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-[#999999] text-sm">
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">Process</a></li>
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">Case Studies</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-[#999999] text-sm">
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">Exit Guide</a></li>
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-[#999999] text-sm">
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-[#C19A47] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#2D2D2D] pt-8">
          <p className="text-[#999999] text-sm text-center mb-2">
            Next Tier Partners operates independently as a digital business acquisition and exit facilitation company.
          </p>
          <p className="text-[#999999] text-sm text-center">
            &copy; 2024 Next Tier Partners. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default HomePageC;