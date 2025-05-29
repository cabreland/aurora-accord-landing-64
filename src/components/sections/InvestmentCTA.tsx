
import React from 'react';
import { DollarSign, CheckCircle, Rocket, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const InvestmentCTA = () => {
  const inclusions = [
    "40–60 hours of automation targeting critical pain points",
    "All 8 implementation phases (Phases 1–3, buyer outreach priority)",
    "Custom automation logic built from your SOPs",
    "Complete tool integration & setup",
    "Team training & comprehensive documentation",
    "30-day optimization support & monitoring"
  ];

  const results = [
    { metric: "15–20 hours", description: "Weekly time savings", icon: Target },
    { metric: "90%", description: "Lead qualification automation", icon: Zap },
    { metric: "<10 sec", description: "Response processing time", icon: Rocket }
  ];

  return (
    <section id="investment" className="py-24 bg-gradient-to-br from-[#0A0F0F] via-[#1A1F2E] to-[#0A0F0F] relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Circuit Pattern */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="investment-circuit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#F4E4BC" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
          <path d="M0,400 Q200,200 400,400 T800,400" stroke="url(#investment-circuit)" strokeWidth="3" fill="none">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="12s" repeatCount="indefinite"/>
          </path>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <div className="mb-12">
          <Badge className="bg-[#D4AF37] text-[#0A0F0F] font-bold px-6 py-3 text-lg mb-6 shadow-lg shadow-[#D4AF37]/30">
            Investment & Next Steps
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#22C55E] bg-clip-text text-transparent leading-tight">
            Ready to Transform Your M&A Operations?
          </h2>
          <p className="text-xl text-[#F4E4BC] max-w-3xl mx-auto">
            Complete automation strategy with immediate ROI and long-term scalability
          </p>
        </div>
        
        {/* Investment Showcase */}
        <div className="bg-gradient-to-br from-[#2A2F3A]/80 to-[#1A1F2E]/80 rounded-3xl p-12 border-2 border-[#D4AF37]/30 mb-12 shadow-2xl shadow-[#D4AF37]/20 backdrop-blur-sm relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#22C55E]/5"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <DollarSign className="w-12 h-12 text-[#D4AF37] mr-4" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-[#D4AF37] rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] bg-clip-text text-transparent">
                3,000
              </span>
            </div>
            
            <p className="text-2xl md:text-3xl text-[#F4E4BC] font-light mb-8">
              Complete Implementation Package
            </p>
            
            {/* Results Preview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {results.map((result, index) => (
                <div key={index} className="bg-[#0A0F0F]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/20">
                  <result.icon className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                  <div className="text-2xl font-bold text-[#22C55E] mb-2">{result.metric}</div>
                  <div className="text-[#F4E4BC] text-sm">{result.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* What's Included */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#2A2F3A]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#D4AF37]/30 text-left">
            <h3 className="text-2xl font-bold text-[#D4AF37] mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-3" />
              Complete Package Includes
            </h3>
            <ul className="space-y-4">
              {inclusions.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                  <span className="text-[#F4E4BC] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-[#2A2F3A]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#22C55E]/30 text-left">
            <h3 className="text-2xl font-bold text-[#22C55E] mb-6 flex items-center">
              <Rocket className="w-6 h-6 mr-3" />
              Immediate Benefits
            </h3>
            <ul className="space-y-4 text-[#F4E4BC]">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                <span>Save 15–20 hours weekly on manual tasks</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                <span>Process 100+ email responses in seconds</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                <span>Eliminate 90% of unqualified leads automatically</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                <span>Accelerate deal flow with instant post-call automation</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                <span>Scale operations without adding overhead</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="space-y-8">
          <Button className="relative bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] hover:from-[#F4E4BC] hover:to-[#D4AF37] text-[#0A0F0F] font-bold px-16 py-8 text-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#D4AF37]/40 border-2 border-[#D4AF37] overflow-hidden group">
            <span className="relative z-10 flex items-center">
              <Rocket className="w-6 h-6 mr-3" />
              Ready to Start? Let's Confirm Your Kickoff
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Button>
          
          <p className="text-[#F4E4BC] text-lg">
            Schedule your implementation kickoff call • 2-3 week delivery timeline
          </p>
          
          {/* Powered by Web Launch */}
          <div className="flex items-center justify-center space-x-3 pt-8">
            <span className="text-[#F4E4BC]">Powered by</span>
            <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] font-bold px-4 py-2">
              Web Launch
            </Badge>
            <span className="text-[#F4E4BC]">• Built for Exclusive Business Brokers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentCTA;
