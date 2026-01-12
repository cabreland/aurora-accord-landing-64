import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 bg-[#0a1628] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-white leading-[1.1] tracking-tight mb-6">
              You can't scale M&A with duct tape and Excel.
            </h1>
            
            <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-lg">
              Stop firefighting. Start leading. The best M&A teams use DealFlow to create repeatable workflows and close deals faster.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-6 h-12">
                  Request a demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-6 h-12"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Watch video
              </Button>
            </div>

            {/* Trust indicator */}
            <p className="mt-8 text-sm text-white/40">
              Trusted by 500+ M&A teams worldwide to close deals faster
            </p>
          </motion.div>

          {/* Right - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-[#1a2744] to-[#0f1a2e] rounded-2xl p-6 shadow-2xl border border-white/10">
              {/* Mock Dashboard */}
              <div className="bg-[#0f1a2e] rounded-xl overflow-hidden border border-white/10">
                {/* Header */}
                <div className="bg-[#0a1628] border-b border-white/10 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                
                {/* Content */}
                <div className="p-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">24</div>
                      <div className="text-xs text-white/50">Active Deals</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">$45M</div>
                      <div className="text-xs text-white/50">Pipeline Value</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-400">89%</div>
                      <div className="text-xs text-white/50">Win Rate</div>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/5">
                    <div className="flex items-end justify-between h-20 gap-1">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-white/70 flex-1">NDA signed - Acme Corp</span>
                      <span className="text-xs text-white/40">2m ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs text-white/70 flex-1">Due diligence started</span>
                      <span className="text-xs text-white/40">1h ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -right-4 top-8 bg-[#1a2744] rounded-lg shadow-lg px-3 py-2 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-white">Deal Closed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
