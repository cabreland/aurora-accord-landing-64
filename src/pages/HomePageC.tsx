import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Scale, Handshake, ArrowRight, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePageC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-[#f9fafb]">
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
    <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#fbbf24] to-[#eab308] rounded-lg flex items-center justify-center">
              <span className="text-[#020617] font-bold text-sm">NT</span>
            </div>
            <span className="text-[#f9fafb] font-extrabold text-lg tracking-tight">Next Tier Partners</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-[#94a3b8] hover:text-[#f9fafb] transition-colors text-sm">How It Works</a>
            <a href="#exit-paths" className="text-[#94a3b8] hover:text-[#f9fafb] transition-colors text-sm">Exit Paths</a>
            <a href="#faq" className="text-[#94a3b8] hover:text-[#f9fafb] transition-colors text-sm">FAQ</a>
          </div>
          
          <Button className="bg-[#fbbf24] hover:bg-[#eab308] text-[#020617] font-semibold rounded-full px-6">
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
      {/* Background with subtle grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617] to-[#111827]">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(to right, #fbbf24 1px, transparent 1px), linear-gradient(to bottom, #fbbf24 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 mb-6">
              <span className="text-[#fbbf24] text-xs font-semibold tracking-wide uppercase">Founder-First Exit Firm</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              The Modern Path to a Fast, Professional Business Exit
            </h1>
            
            <div className="space-y-3 mb-8 text-[#94a3b8] text-lg leading-relaxed">
              <p>Exit your digital business in 45 days through our licensed brokerage infrastructure.</p>
              <p>We handle valuation, buyer sourcing, and closing while you stay in control.</p>
              <p>Backed by Exclusive Business Brokers — fully licensed, compliant, confidential.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#fbbf24] hover:bg-[#eab308] text-[#020617] font-semibold rounded-full px-8 py-6 text-base">
                Apply for a 45-Day Exit Plan
              </Button>
              <a href="#how-it-works" className="flex items-center justify-center gap-2 text-[#fbbf24] hover:text-[#eab308] transition-colors text-base font-medium">
                See how the process works <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Right Column - Dashboard Mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b] text-sm uppercase tracking-wide">Exit Dashboard</span>
                  <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
                </div>
                
                <div className="border-t border-white/5 pt-4">
                  <div className="text-[#64748b] text-xs mb-2">Estimated Valuation</div>
                  <div className="text-3xl font-bold text-[#fbbf24]">$2.4M – $3.1M</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <div className="text-[#64748b] text-xs mb-1">Target Timeline</div>
                    <div className="text-lg font-semibold">45 Days</div>
                  </div>
                  <div>
                    <div className="text-[#64748b] text-xs mb-1">Active Buyers</div>
                    <div className="text-lg font-semibold">12+</div>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748b]">Valuation Complete</span>
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748b]">Buyer Outreach</span>
                    <div className="text-[#fbbf24] font-medium">In Progress</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748b]">Due Diligence</span>
                    <span className="text-[#64748b]">Pending</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Accent line */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-[#fbbf24]/30 rounded-tr-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Trust Strip
function TrustStrip() {
  return (
    <div className="border-y border-white/5 bg-[#020617]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center gap-3 text-sm text-[#64748b]">
          <Shield className="w-4 h-4 text-[#fbbf24]" />
          <span>Backed by Exclusive Business Brokers — licensed, compliant, confidential transactions</span>
        </div>
      </div>
    </div>
  );
}

// What We Do Section
function WhatWeDo() {
  const pillars = [
    {
      icon: Zap,
      title: "Exit Fast",
      description: "Sell your digital business in approximately 45 days through our buyer network and brokerage infrastructure."
    },
    {
      icon: Shield,
      title: "Exit Safely",
      description: "Licensed, compliant, confidential transactions handled by Exclusive Business Brokers."
    },
    {
      icon: Scale,
      title: "Scale Before Exit",
      description: "Use AI-driven growth and automation to increase valuation before going to market."
    },
    {
      icon: Handshake,
      title: "Post-Exit Partnerships",
      description: "Partner with us on your next venture using our growth infrastructure."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            What We Do for Modern Founders
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Professional exits, growth partnerships, and post-exit infrastructure for digital businesses.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-6 hover:border-[#fbbf24]/30 transition-all duration-300 group">
              <pillar.icon className="w-10 h-10 text-[#fbbf24] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">{pillar.description}</p>
              <a href="#" className="text-[#fbbf24] text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          ))}
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
          <div className="rounded-2xl border-2 border-[#fbbf24] bg-black/40 backdrop-blur p-8 relative">
            <div className="absolute -top-3 right-8 bg-[#fbbf24] text-[#020617] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Our Approach
            </div>
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-[#fbbf24]" />
              <h3 className="text-2xl font-bold">Next Tier Partners</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Founder-first approach with fair market valuations",
                "Licensed via Exclusive Business Brokers",
                "45-day target timeline from start to close",
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
      subtitle: "Brokered Exit",
      description: "Work with our licensed brokerage arm to market, negotiate, and close your sale with qualified buyers.",
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
    <footer className="py-12 bg-[#020617] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#fbbf24] to-[#eab308] rounded-lg flex items-center justify-center">
              <span className="text-[#020617] font-bold text-sm">NT</span>
            </div>
            <span className="text-[#f9fafb] font-extrabold text-lg">Next Tier Partners</span>
          </div>
          
          <div className="text-[#64748b] text-sm text-center">
            Licensed transactions through Exclusive Business Brokers · {new Date().getFullYear()}
          </div>
          
          <div className="flex gap-6 text-sm text-[#64748b]">
            <a href="#" className="hover:text-[#f9fafb] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#f9fafb] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#f9fafb] transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HomePageC;