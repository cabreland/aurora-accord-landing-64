import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Building2, TrendingUp, Lock, Users, ArrowRight, 
  Award, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TourBanner,
  EnhancedNavigation,
  DealLifecycleFlow,
  AnimatedStats,
  TrustBadges,
  InteractiveComparison,
  TestimonialCarousel,
  EnhancedFooter,
  StickyDemoButton,
} from '@/components/homepage';

const Homepage = () => {
  const features = [
    { 
      icon: Building2, 
      title: 'Deal Management', 
      description: 'Streamline your entire M&A workflow from initial outreach to closing. Track deals, manage pipelines, and never miss a critical milestone.',
      highlight: 'End-to-end workflow'
    },
    { 
      icon: Lock, 
      title: 'Secure Data Rooms', 
      description: 'Bank-grade encryption with granular access controls. Share sensitive documents with confidence knowing every action is tracked.',
      highlight: 'SOC 2 compliant'
    },
    { 
      icon: TrendingUp, 
      title: 'Due Diligence', 
      description: 'Comprehensive tracking of all diligence requests, documents, and communications. Stay organized throughout the entire process.',
      highlight: 'Real-time tracking'
    },
    { 
      icon: Users, 
      title: 'Investor Relations', 
      description: 'Centralized hub for all investor communications. Manage NDAs, access requests, and keep stakeholders informed.',
      highlight: 'Single source of truth'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      {/* Tour Banner */}
      <TourBanner />
      
      {/* Enhanced Navigation */}
      <EnhancedNavigation />
      
      {/* Sticky Demo Button */}
      <StickyDemoButton />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0C10] via-[#111318] to-[#0A0C10]" />
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] mb-8">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-white/70">Trusted by leading M&A professionals</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              The modern platform for{' '}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
                M&A excellence
              </span>
            </h1>
            
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Streamline deal flow, secure document sharing, and close transactions faster with the industry's most trusted data room platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] hover:opacity-90 font-semibold px-8 h-14 text-base">
                  Request a Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/[0.05] px-8 h-14 text-base">
                  Explore Features
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats */}
      <AnimatedStats />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Deal Lifecycle Flow */}
      <DealLifecycleFlow />

      {/* Features Section */}
      <section id="features" className="relative py-24 bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need for{' '}
              <span className="text-[#D4AF37]">successful deals</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              From first contact to closing, our platform provides the tools you need to execute transactions efficiently and securely.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-[#D4AF37]/30 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center flex-shrink-0 group-hover:from-[#D4AF37]/30 group-hover:to-[#D4AF37]/10 transition-all">
                    <feature.icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium">
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Comparison */}
      <InteractiveComparison />

      {/* Testimonial Carousel */}
      <TestimonialCarousel />

      {/* CTA Section */}
      <section className="relative py-24 bg-[#0A0C10]">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your{' '}
              <span className="text-[#D4AF37]">M&A process</span>?
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Join hundreds of M&A professionals who trust DealFlow for their most critical transactions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] hover:opacity-90 font-semibold px-10 h-14 text-base">
                  Request a Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/[0.05] px-10 h-14 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <EnhancedFooter />
    </div>
  );
};

export default Homepage;
