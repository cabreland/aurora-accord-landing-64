import React, { useState, useEffect, useCallback } from 'react';
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
import circuitTransitionBg from '@/assets/circuit-transition-bg.png';
import decisionForkPath from '@/assets/decision-fork-path.jpg';

// Global Cursor Spotlight - reveals circuits across the entire page
function GlobalCursorSpotlight() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [scrollY, setScrollY] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    setScrollY(window.scrollY);
    if (!isActive) setIsActive(true);
  }, [isActive]);

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsActive(false);
    setMousePos({ x: -500, y: -500 });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleScroll, handleMouseLeave]);

  // Calculate mask position relative to scrolling background
  const maskY = mousePos.y + scrollY;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Tiling circuit pattern that scrolls with page */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          backgroundImage: `url(${bgCircuitPattern})`,
          backgroundPosition: `0px ${-scrollY}px`,
          backgroundSize: '300px 300px',
          backgroundRepeat: 'repeat',
          opacity: isActive ? 0.4 : 0,
          maskImage: `radial-gradient(circle 140px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 140px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`
        }}
      />
      
      {/* Subtle gold glow following cursor */}
      <div 
        className="absolute pointer-events-none transition-opacity duration-200 ease-out"
        style={{
          width: '300px',
          height: '300px',
          left: mousePos.x - 150,
          top: mousePos.y - 150,
          background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
          opacity: isActive ? 1 : 0
        }}
      />
    </div>
  );
}

const HomePageC = () => {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-white relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Global cursor spotlight effect */}
      <GlobalCursorSpotlight />
      
      <Navigation />
      <Hero />
      <OurStory />
      <DecisionPath />
      <WhyNextTier />
      <FAQ />
      <FinalCTA />
      <Footer />
      
      {/* Static circuit pattern overlay - very subtle base layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
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

// Spotlight Box Component - cursor-following reveal effect
function SpotlightBox({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Move spotlight off-screen to prevent flash
    setMousePos({ x: -200, y: -200 });
  };

  return (
    <div 
      ref={boxRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Circuit background that shows through spotlight - always has mask applied */}
      <div 
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          backgroundImage: `url(${circuitTransitionBg})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: isHovering ? 1 : 0,
          maskImage: `radial-gradient(circle 120px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 120px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`
        }}
      />
      
      {/* Spotlight glow effect */}
      <div 
        className="absolute pointer-events-none transition-opacity duration-500 ease-out"
        style={{
          width: '240px',
          height: '240px',
          left: mousePos.x - 120,
          top: mousePos.y - 120,
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          opacity: isHovering ? 1 : 0
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Section 2: Our Story - Premium Two-Column Layout with Circuit Background
function OurStory() {
  const evolutionPhases = [
    { phase: "01", title: "Brokerage", description: "Helped founders exit $100M+ in digital businesses" },
    { phase: "02", title: "Discovery", description: "Identified the broken parts of the industry" },
    { phase: "03", title: "Innovation", description: "Built a faster, cleaner, founder-first process" },
    { phase: "04", title: "Evolution", description: "Became the buyer we always wished existed" }
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Base dark background - matching header darkness */}
      <div className="absolute inset-0 bg-[#0A0C10]" />
      
      {/* Very subtle circuit pattern - barely visible, like header */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${circuitTransitionBg})`,
            backgroundPosition: 'center right',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.08
          }}
        />
        
        {/* Strong gradient overlays to keep it dark */}
        <div className="absolute inset-0 bg-[#0A0C10]/85" />
        
        {/* Top fade */}
        <div 
          className="absolute inset-x-0 top-0 h-32" 
          style={{ background: 'linear-gradient(to bottom, #0A0C10 0%, transparent 100%)' }} 
        />
        
        {/* Bottom fade */}
        <div 
          className="absolute inset-x-0 bottom-0 h-32" 
          style={{ background: 'linear-gradient(to top, #0A0C10 0%, transparent 100%)' }} 
        />
      </div>
      
      {/* Very subtle gold ambient glow */}
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-[#F4D77F] text-sm font-medium tracking-widest uppercase mb-4">Our Origin</p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN - Story */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-[-0.02em] leading-[1.1]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
              We didn't start as buyers.
            </h2>
            <p className="text-xl md:text-2xl text-[#F4D77F] font-semibold mb-8 tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
              We started by helping founders exit.
            </p>
            
            <div className="space-y-5 text-white/70 leading-relaxed tracking-tight">
              <p>
                We didn't start as buyers — we started on the other side. For years we ran Exclusive Business Brokers and watched great founders get dragged through a broken system. NDAs that led nowhere. LOIs that collapsed before funding. "Buyers" who were never actually buyers. Deals that should've taken weeks dragged into 6–12-month nightmares.
              </p>
              <p>
                After seeing too many founders lose time, money, and momentum, we built something different. <span className="text-white font-medium">Next Tier Partners is the evolution</span> — a real buyer with real capital, a real process, and a real timeline. No middlemen, no games, no waiting.
              </p>
              <p>
                If your business is a fit, we acquire it directly. And if not, we still guide you through our vetted exit network using the same fast, founder-first process.
              </p>
            </div>

            {/* Bottom accent */}
            <div className="mt-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
              <span className="text-[#F4D77F]/60 text-xs font-medium tracking-widest uppercase">Built Different</span>
            </div>
          </motion.div>

          {/* RIGHT COLUMN - Evolution Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Circuit glow behind the box */}
            <div className="absolute -inset-8 -z-10 overflow-hidden rounded-[40px]">
              {/* Circuit image */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${circuitTransitionBg})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  opacity: 0.25
                }}
              />
              {/* Gold glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-[#F4D77F]/10 to-transparent" />
              {/* Radial glow from center */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, transparent 70%)'
                }}
              />
              {/* Blur the edges */}
              <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>
            
            <SpotlightBox className="p-8 md:p-10 rounded-3xl border border-[#D4AF37]/30 bg-[rgba(10,12,16,0.85)] backdrop-blur-[30px]">
              {/* Background glow inside */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#D4AF37]/15 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-[#F4D77F]/10 rounded-full blur-[60px]" />
              
              {/* Circuit pattern inside */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-[0.04]" style={{
                backgroundImage: `url(${bgCircuitPattern})`,
                backgroundSize: '150px 150px'
              }} />
              
              <div className="relative">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-8 tracking-tight flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F4D77F] to-[#D4AF37] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#0A0C10]" />
                  </span>
                  How We Evolved
                </h3>
                
                {/* Timeline */}
                <div className="space-y-6">
                  {evolutionPhases.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="relative flex gap-4 group"
                    >
                      {/* Timeline line */}
                      {idx < evolutionPhases.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-[#D4AF37]/40 to-[#D4AF37]/10" />
                      )}
                      
                      {/* Phase indicator */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/30 bg-[#0A0C10] flex items-center justify-center group-hover:border-[#D4AF37]/60 group-hover:bg-[#D4AF37]/10 transition-all duration-300">
                          <span className="text-[#F4D77F] text-xs font-mono font-bold">{item.phase}</span>
                        </div>
                        {/* Glow on hover */}
                        <div className="absolute inset-0 rounded-xl bg-[#D4AF37]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* Content */}
                      <div className="pt-1.5">
                        <h4 className="text-white font-semibold text-base mb-1 tracking-tight group-hover:text-[#F4D77F] transition-colors duration-300">
                          {item.title}
                        </h4>
                        <p className="text-white/50 text-sm leading-relaxed tracking-tight">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom tagline */}
                <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                    <span className="text-[#F4D77F]">Real capital</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white">Real process</span>
                    <span className="text-white/20">·</span>
                    <span className="text-[#F4D77F]">Real timeline</span>
                  </div>
                </div>
              </div>
            </SpotlightBox>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Decision Path Section - Visual Comparison with hover highlighting
function DecisionPath() {
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  
  const traditionalPains = [
    "6-12 month process (minimum)",
    "Dozens of NDAs leading nowhere", 
    "Lowball offers from tire-kickers",
    "Brokers who don't get digital",
    "Confidentiality at risk"
  ];

  const ourApproach = [
    "45-60 days, start to close",
    "One conversation. One buyer.",
    "Fair valuations, no games",
    "Digital-native principals",
    "Confidential until close"
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background fork image - red left, gold right */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url(${decisionForkPath})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: hoveredSide ? 0.6 : 0.35
          }}
        />
        
        {/* Left red highlight overlay - shows when hovering left card */}
        <div 
          className="absolute inset-y-0 left-0 w-1/2 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to right, rgba(239,68,68,0.15) 0%, transparent 100%)',
            opacity: hoveredSide === 'left' ? 1 : 0
          }}
        />
        
        {/* Right gold highlight overlay - shows when hovering right card */}
        <div 
          className="absolute inset-y-0 right-0 w-1/2 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to left, rgba(212,175,55,0.2) 0%, transparent 100%)',
            opacity: hoveredSide === 'right' ? 1 : 0
          }}
        />
        
        {/* Top/bottom fade to black */}
        <div className="absolute inset-x-0 top-0 h-48" style={{ background: 'linear-gradient(to bottom, #0A0C10 0%, transparent 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: 'linear-gradient(to top, #0A0C10 0%, transparent 100%)' }} />
        
        {/* Base dark overlay */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{ 
            backgroundColor: '#0A0C10',
            opacity: hoveredSide ? 0.4 : 0.55
          }} 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#F4D77F] text-sm font-medium tracking-widest uppercase mb-4">Choose Your Path</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-[-0.02em] leading-[1.1]" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            Two ways to exit.{' '}
            <span className="bg-gradient-to-r from-[#F4D77F] via-[#D4AF37] to-[#F4D77F] bg-clip-text text-transparent">
              One clear choice.
            </span>
          </h2>
        </motion.div>

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left Card - Traditional Way */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onMouseEnter={() => setHoveredSide('left')}
            onMouseLeave={() => setHoveredSide(null)}
            className={`rounded-2xl border bg-[rgba(10,12,16,0.85)] backdrop-blur-[30px] p-8 relative overflow-hidden transition-all duration-300 ${
              hoveredSide === 'left' 
                ? 'border-red-500/50 shadow-lg shadow-red-500/20' 
                : 'border-white/10'
            }`}
          >
            {/* Static subtle red glow */}
            <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[80px] pointer-events-none transition-opacity duration-300 ${
              hoveredSide === 'left' ? 'bg-red-500/25' : 'bg-red-500/10'
            }`} />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors duration-300 ${
                  hoveredSide === 'left' 
                    ? 'border-red-500/50 bg-red-500/20' 
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                  The Traditional Way
                </h3>
              </div>
              
              <ul className="space-y-4">
                {traditionalPains.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white/60">
                    <XCircle className="w-4 h-4 text-red-400/60 mt-0.5 flex-shrink-0" />
                    <span className="text-sm tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-white/40 text-sm tracking-tight">
                  Months of uncertainty. Endless back-and-forth. Still no guarantee.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Card - Our Approach */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            onMouseEnter={() => setHoveredSide('right')}
            onMouseLeave={() => setHoveredSide(null)}
            className={`rounded-2xl border bg-[rgba(10,12,16,0.85)] backdrop-blur-[30px] p-8 relative overflow-hidden transition-all duration-300 ${
              hoveredSide === 'right' 
                ? 'border-[#D4AF37]/60 shadow-xl shadow-[#D4AF37]/25' 
                : 'border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/10'
            }`}
          >
            {/* Static gold glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] pointer-events-none transition-opacity duration-300 ${
              hoveredSide === 'right' ? 'bg-[#D4AF37]/30' : 'bg-[#D4AF37]/15'
            }`} />
            
            {/* Badge */}
            <div className="absolute -top-px right-8 bg-gradient-to-r from-[#F4D77F] to-[#D4AF37] text-[#0A0C10] px-4 py-1.5 rounded-b-lg text-xs font-bold uppercase tracking-wide">
              Recommended
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors duration-300 ${
                  hoveredSide === 'right' 
                    ? 'border-[#D4AF37]/60 bg-[#D4AF37]/25' 
                    : 'border-[#D4AF37]/30 bg-[#D4AF37]/10'
                }`}>
                  <CheckCircle2 className="w-5 h-5 text-[#F4D77F]" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                  The Next Tier Way
                </h3>
              </div>
              
              <ul className="space-y-4">
                {ourApproach.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-[#D4AF37]/10">
                <p className="text-[#F4D77F]/80 text-sm tracking-tight font-medium">
                  Cash at close. Certainty from day one.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
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
