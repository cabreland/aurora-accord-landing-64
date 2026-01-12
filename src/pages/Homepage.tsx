import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Building2, TrendingUp, Lock, Users, ArrowRight, 
  CheckCircle, XCircle, Star, BarChart3, FileText, Clock,
  Zap, Globe, Award, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const comparisons = [
    { 
      old: 'Scattered emails and shared drives',
      new: 'Centralized, searchable data room'
    },
    { 
      old: 'Manual NDA tracking in spreadsheets',
      new: 'Automated NDA workflow with e-signatures'
    },
    { 
      old: 'No visibility into document access',
      new: 'Real-time activity logs and analytics'
    },
    { 
      old: 'Inconsistent investor communication',
      new: 'Structured messaging with full audit trail'
    },
    { 
      old: 'Risk of data breaches',
      new: 'Enterprise-grade security and encryption'
    },
  ];

  const metrics = [
    { value: '500+', label: 'Deals Closed', icon: BarChart3 },
    { value: '$2.5B+', label: 'Transaction Volume', icon: TrendingUp },
    { value: '99.9%', label: 'Uptime SLA', icon: Zap },
    { value: '50%', label: 'Faster Closings', icon: Clock },
  ];

  const testimonials = [
    {
      quote: "EBB Data Room transformed how we manage our M&A pipeline. The security features alone saved us countless hours of compliance work.",
      author: "Michael Chen",
      role: "Managing Partner",
      company: "Apex Capital Partners"
    },
    {
      quote: "The due diligence tracking is exceptional. We've cut our deal cycle time by 40% since implementing the platform.",
      author: "Sarah Williams",
      role: "Director of Operations",
      company: "Sterling Acquisitions"
    },
    {
      quote: "Finally, a data room built by people who understand M&A. The investor portal is exactly what we needed.",
      author: "David Park",
      role: "VP of Business Development",
      company: "Harbor Growth Equity"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0A0C10]" />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">EBB Data Room</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#comparison" className="text-sm text-white/60 hover:text-white transition-colors">Why EBB</a>
              <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Testimonials</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/[0.05]">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] hover:opacity-90 font-medium">
                  Request Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
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

            {/* Hero Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {metrics.map((metric, index) => (
                <div key={metric.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-white/50">{metric.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

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
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-[#D4AF37]/30 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center flex-shrink-0">
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

      {/* Comparison Section */}
      <section id="comparison" className="relative py-24 bg-[#0A0C10]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The <span className="text-red-400">old way</span> vs{' '}
              <span className="text-[#D4AF37]">the EBB way</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              See how EBB Data Room transforms your M&A operations
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-4">
              {comparisons.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="grid md:grid-cols-2 gap-4"
                >
                  {/* Old Way */}
                  <div className="flex items-center gap-4 p-5 rounded-xl bg-red-500/5 border border-red-500/10">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-white/70">{item.old}</span>
                  </div>
                  {/* New Way */}
                  <div className="flex items-center gap-4 p-5 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-white">{item.new}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-24 bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by <span className="text-[#D4AF37]">industry leaders</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              See what M&A professionals are saying about EBB Data Room
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-white/50">{testimonial.role}</div>
                  <div className="text-sm text-[#D4AF37]">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              Join hundreds of M&A professionals who trust EBB Data Room for their most critical transactions.
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

      {/* Footer */}
      <footer className="bg-[#0A0C10] border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0A0C10]" />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">EBB Data Room</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
            </div>

            <div className="text-sm text-white/40">
              © 2024 EBB Partners. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
