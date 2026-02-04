import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  ChevronDown,
  Sparkles
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
      <OurStory />
      <WhyNextTier />
      <FAQ />
      <FinalCTA />
      <Footer />
      
      {/* Circuit pattern overlay */}
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

// Hero Section - The Hook
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0A0C10]" />
      
      {/* Hero image - positioned on right half */}
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
        {/* Gradient fades for seamless blend */}
        <div className="absolute inset-y-0 left-0 w-1/3 pointer-events-none" style={{ background: 'linear-gradient(to right, #0A0C10 0%, transparent 100%)' }} />
        <div className="absolute inset-x-0 top-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #0A0C10 0%, transparent 100%)' }} />
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
              We buy profitable digital businesses.{' '}
              <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
                Cash. 45-60 days.
              </span>
            </h1>
            
            <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-lg tracking-tight">
              Next Tier Partners acquires digital businesses that are ready for professional ownership. If you've built a profitable SaaS, agency, or content business and want a fast exit with certainty—we're your buyer.
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
                  className="flex items-center gap-3 text-white/80 tracking-tight"
                >
                  <span className="text-[#F4D77F]">→</span>
                  {item}
                </motion.p>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
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
                <a href="#faq">Learn More</a>
              </Button>
            </div>
          </motion.div>

          {/* Right side - empty, letting the background image do the work */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}

// Section 2: Our Story - About Us
function OurStory() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0D0F14] to-[#0A0C10]" />
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#F4D77F]/6 to-[#D4AF37]/3 rounded-full blur-[180px]" />
      
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            Built From Inside the{' '}
            <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
              Digital Exit Process
            </span>
          </h2>
          <p className="text-lg text-white/60 tracking-tight">
            Why We Created a Better Way to Sell Your Business
          </p>
        </motion.div>
        
        {/* Story Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 text-white/80 leading-relaxed tracking-tight text-center"
        >
          <p>
            We didn't start as buyers. We started on the other side — representing founders just like you.
          </p>
          
          <p>
            For years, we helped founders exit their digital companies. We've seen every angle of the process — the good, the bad, and the downright unbearable.
          </p>
          
          <p className="text-white/60">
            Here's the part no one likes to admit:
          </p>
          
          <div className="text-left max-w-xl mx-auto">
            <ul className="space-y-2 pl-1">
              {[
                "Most 'buyers' never close.",
                "Most NDAs lead nowhere.",
                "Most LOIs collapse before funding.",
                "And founders waste months on conversations that should've taken days."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#F4D77F] mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <p>
            We watched incredible businesses get tied up in endless diligence loops… only for the deal to die because the buyer wasn't real, wasn't funded, or wasn't serious.
          </p>
          
          <p>
            After years of watching founders lose time, money, and momentum…{' '}
            <span className="text-white font-semibold">we built a better way.</span>
          </p>
          
          <p className="text-[#F4D77F]/90 font-medium text-lg">
            Next Tier Partners was created so we could be the buyer we always wished existed.
          </p>
          
          <div className="space-y-2">
            <p className="text-white font-semibold">Real capital. Real professional process. Real timeline.</p>
            <p className="text-white/70">No middlemen. No games. No "we're still reviewing." No 6-month rollercoasters.</p>
          </div>
          
          <p>
            We buy businesses directly — fast, clean, and transparently.
          </p>
          
          <p className="text-white/60">
            And if your business isn't the right fit for our portfolio, we still help you exit through our vetted partner network using the same structured, founder-friendly process.
          </p>
          
          <p className="text-white/80 font-medium">
            Because your time shouldn't be wasted.
          </p>
          
          <p className="text-white font-semibold">
            And selling your business shouldn't feel like a second full-time job.
          </p>
        </motion.div>
        
        {/* Footer line */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 pt-8 border-t border-[rgba(255,255,255,0.06)]"
        >
          <p className="text-lg text-white/60 tracking-tight">
            There's a better way:{' '}
            <span className="text-[#F4D77F] font-semibold">one buyer, one conversation, cash in 45–60 days.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Why Next Tier - Credibility
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
            Why Founders Choose{' '}
            <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
              Next Tier
            </span>
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Traditional Process */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-red-500/20 bg-[rgba(255,255,255,0.02)] backdrop-blur-[30px] p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>The Traditional Way</h3>
            </div>
            <ul className="space-y-4">
              {[
                "6-12 months of your time (minimum)",
                "Dozens of NDAs and dead-end calls",
                "Lowball offers from unqualified buyers",
                "Brokers who don't understand digital",
                "Uncertainty until the wire hits",
                "Confidentiality leaks to competitors"
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
                The Next Tier Way
              </div>
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-6 h-6 text-[#F4D77F]" />
                <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>Our Approach</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "45-60 days from application to close",
                  "One conversation. One buyer. Done.",
                  "Fair valuations—no games or lowballs",
                  "We're principals—digital is all we do",
                  "Cash payment at close, guaranteed",
                  "Confidential until you decide to move"
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

        {/* Trust line */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-white/40 tracking-tight">
            Not a fit for direct acquisition?{' '}
            <span className="text-white/60">We guide founders through clean exits via our vetted partner network.</span>
          </p>
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
      question: "What types of businesses do you acquire?",
      answer: "We acquire profitable digital businesses: SaaS, agencies, content/media sites, e-commerce brands, and subscription businesses. Typically $300K–$2.5M in enterprise value with at least $100K in annual profit."
    },
    {
      question: "How does the 45-60 day timeline work?",
      answer: "After you apply, we review and respond within 72 hours. If there's mutual interest, we present an offer within 7 days. From accepted offer to close is typically 45-60 days—including due diligence and legal."
    },
    {
      question: "What if my business isn't a fit for direct acquisition?",
      answer: "We still help. If we can't buy directly, we connect you with qualified buyers in our vetted partner network and guide you through a clean, structured exit. One offer doesn't mean one option."
    },
    {
      question: "How is this different from listing with a broker?",
      answer: "Brokers list your business publicly, field dozens of unqualified inquiries, and the process takes 6-12+ months. We're the buyer. One conversation. No tire-kickers. 45-60 days."
    },
    {
      question: "What fees should I expect?",
      answer: "For direct acquisitions, there are no seller-side fees—we're the buyer. If we facilitate an exit through our partner network, we discuss terms upfront. No hidden costs, ever."
    },
    {
      question: "Is the process confidential?",
      answer: "Completely. We don't share your information with anyone until you explicitly approve. Your employees, customers, and competitors won't know you're exploring an exit."
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
            Questions?
          </h2>
          <p className="text-white/50 tracking-tight">
            Everything you need to know before applying.
          </p>
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

// Final CTA - The Offer
function FinalCTA() {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* CTA circuit background */}
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
            Skip the 12-month nightmare.{' '}
            <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
              Get an offer in 7 days.
            </span>
          </h2>
          
          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto tracking-tight">
            Apply below for a confidential review. We'll assess your business and present an offer within 7 days—no pressure, no commitment, no tire-kickers.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#F4D77F] text-[#0A0C10] font-semibold px-10 h-14 shadow-xl shadow-[#D4AF37]/30 transition-all duration-300 text-lg tracking-tight"
            >
              Start Your Exit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-white/40 flex-wrap">
            {[
              'Cash payment',
              '45-60 day close',
              'Completely confidential'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F4D77F]/60" />
                <span className="tracking-tight">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#0A0C10]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={nextTierLogo} alt="Next Tier Partners" className="h-8 w-auto" />
            <span className="text-white/40 text-sm tracking-tight">Next Tier Partners</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-white/40">
            <a href="#how-it-works" className="hover:text-white/60 transition-colors tracking-tight">How It Works</a>
            <a href="#faq" className="hover:text-white/60 transition-colors tracking-tight">FAQ</a>
            <Link to="/auth" className="hover:text-white/60 transition-colors tracking-tight">Investor Login</Link>
          </div>
          
          <div className="text-sm text-white/30 tracking-tight">
            © {new Date().getFullYear()} Next Tier Partners
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HomePageC;
