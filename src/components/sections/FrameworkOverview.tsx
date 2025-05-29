
import React from 'react';
import { Zap, Target, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FrameworkOverview = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#1A1F2E] to-[#0A0F0F] relative overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#22C55E]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#22C55E] via-[#D4AF37] to-[#F4E4BC] bg-clip-text text-transparent">
            Framework Overview
          </h2>
          <p className="text-xl text-[#F4E4BC] max-w-3xl mx-auto">
            Our three-pillar approach to M&A automation excellence
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Wins */}
          <Card className="bg-[#2A2F3A]/80 border-[#22C55E]/30 hover:border-[#22C55E] transition-all duration-500 transform hover:scale-105 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-[#22C55E]/20 group">
            <CardHeader className="text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/5 via-transparent to-[#22C55E]/5 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/10 rounded-2xl mx-auto mb-6 flex items-center justify-center border-2 border-[#22C55E]/30 shadow-lg">
                  <Zap className="w-10 h-10 text-[#22C55E]" />
                </div>
                <CardTitle className="text-2xl text-[#22C55E] mb-4">Quick Wins</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center relative z-10">
              <p className="text-[#F4E4BC] mb-6 leading-relaxed">
                Immediate, high-impact automations delivering results in 2–3 weeks, saving 15–20 hours weekly with fast ROI
              </p>
              <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30 font-bold px-4 py-2">
                Easy, Fast ROI
              </Badge>
              
              {/* Feature Highlights */}
              <div className="mt-6 space-y-2 text-left">
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                  <span>Email triage automation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                  <span>Lead qualification filtering</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                  <span>Post-call automation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why It Matters */}
          <Card className="bg-[#2A2F3A]/80 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-500 transform hover:scale-105 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20 group">
            <CardHeader className="text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#D4AF37]/5 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#F4E4BC]/10 rounded-2xl mx-auto mb-6 flex items-center justify-center border-2 border-[#D4AF37]/30 shadow-lg">
                  <Target className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <CardTitle className="text-2xl text-[#D4AF37] mb-4">Why It Matters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center relative z-10">
              <p className="text-[#F4E4BC] mb-6 leading-relaxed">
                Strategic purpose behind each phase, aligning with your goals to accelerate deals, improve lead quality, and scale operations
              </p>
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 font-bold px-4 py-2">
                Strategic Value
              </Badge>
              
              {/* Strategic Benefits */}
              <div className="mt-6 space-y-2 text-left">
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                  <span>Deal acceleration</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                  <span>Quality improvement</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                  <span>Scalable operations</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Layers */}
          <Card className="bg-[#2A2F3A]/80 border-[#F4E4BC]/30 hover:border-[#F4E4BC] transition-all duration-500 transform hover:scale-105 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-[#F4E4BC]/20 group">
            <CardHeader className="text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F4E4BC]/5 via-transparent to-[#F4E4BC]/5 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-[#F4E4BC]/20 to-[#F4E4BC]/10 rounded-2xl mx-auto mb-6 flex items-center justify-center border-2 border-[#F4E4BC]/30 shadow-lg">
                  <Brain className="w-10 h-10 text-[#F4E4BC]" />
                </div>
                <CardTitle className="text-2xl text-[#F4E4BC] mb-4">Smart Layers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center relative z-10">
              <p className="text-[#F4E4BC] mb-6 leading-relaxed">
                Advanced automation features to future-proof your pipeline, like NLP for emails, buyer-seller fit scoring, and upsell dashboards
              </p>
              <Badge className="bg-[#F4E4BC]/20 text-[#F4E4BC] border-[#F4E4BC]/30 font-bold px-4 py-2">
                AI-Powered
              </Badge>
              
              {/* Advanced Features */}
              <div className="mt-6 space-y-2 text-left">
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#F4E4BC] rounded-full"></div>
                  <span>NLP processing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#F4E4BC] rounded-full"></div>
                  <span>Predictive scoring</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#F4E4BC]">
                  <div className="w-2 h-2 bg-[#F4E4BC] rounded-full"></div>
                  <span>Future-proof architecture</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Integration Line */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-[#2A2F3A]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/30">
            <div className="flex space-x-2">
              <Zap className="w-6 h-6 text-[#22C55E]" />
              <Target className="w-6 h-6 text-[#D4AF37]" />
              <Brain className="w-6 h-6 text-[#F4E4BC]" />
            </div>
            <span className="text-[#FAFAFA] text-lg font-medium">Integrated for maximum impact</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameworkOverview;
