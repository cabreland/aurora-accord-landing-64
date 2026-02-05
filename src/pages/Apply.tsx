import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Clock, DollarSign } from "lucide-react";
import IntakeForm from "@/components/IntakeForm";
import ntpLogoFull from "@/assets/ntp-logo-full.png";

const Apply = () => {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0C10]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/home-page-c" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <img 
            src={ntpLogoFull} 
            alt="Next Tier Partners" 
            className="h-8 w-auto object-contain" 
          />
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Two Column Layout on Desktop */}
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left Column - Info (2 cols) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Start Your Exit
              </h1>
              <p className="text-white/60 mb-8 leading-relaxed">
                Complete this quick form and we'll review your business within 24 hours. 
                No obligations, completely confidential.
              </p>

              {/* Trust Badges */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Offer in 7 Days</h3>
                    <p className="text-white/50 text-sm">We move fast. Get a preliminary offer within one week.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">15-30 Day Close</h3>
                    <p className="text-white/50 text-sm">Cash payment. No drawn-out negotiations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">100% Confidential</h3>
                    <p className="text-white/50 text-sm">Your information is protected. We're principals, not brokers.</p>
                  </div>
                </div>
              </div>

              {/* Testimonial or Social Proof */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3">What founders say</p>
                <blockquote className="text-white/70 text-sm italic leading-relaxed">
                  "From first call to cash in hand—18 days. Next Tier made what I thought would be a nightmare into the easiest decision of my career."
                </blockquote>
                <p className="text-white/50 text-sm mt-2">— SaaS Founder, $1.2M Exit</p>
              </div>
            </motion.div>

            {/* Right Column - Form (3 cols) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="bg-[rgba(255,255,255,0.02)] border border-white/10 rounded-2xl p-6 md:p-8">
                <IntakeForm />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>© {new Date().getFullYear()} Next Tier Partners. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Apply;
