
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Filter, CheckCircle } from 'lucide-react';

const ExecutiveSummary = () => {
  return (
    <section id="executive-summary" className="py-24 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] relative overflow-hidden">
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            Executive Summary
          </h2>
          
          {/* Hero Quote Box */}
          <div className="relative max-w-5xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-[#D4AF37]/20 via-[#F4E4BC]/10 to-[#D4AF37]/20 p-8 rounded-2xl border-2 border-[#D4AF37]/30 backdrop-blur-sm shadow-2xl shadow-[#D4AF37]/20">
              <p className="text-lg md:text-xl text-[#FAFAFA] leading-relaxed mb-6">
                Jack, at Exclusive Business Brokers, your M&A operations are poised for a breakthrough. Our team at Web Launch has crafted a tailored automation strategy to transform your pipeline into an AI-powered, seamless system. Leveraging your detailed SOPs, we've designed a $3,000, 2–3 week plan to eliminate bottlenecks, accelerate deals, and scale your operations—starting with your seller-side (140,000 emails/month) and buyer-side processes.
              </p>
              <Badge className="bg-[#D4AF37] text-[#0A0F0F] font-bold px-4 py-2 text-sm shadow-lg">
                Built from Jack's SOP Notes
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-[#2A2F3A]/80 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 transform hover:scale-105 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-4xl md:text-5xl font-bold text-[#D4AF37] mb-3 bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] bg-clip-text text-transparent">140K</div>
                <div className="text-[#FAFAFA] text-lg font-medium">emails/month across 1,000 inboxes</div>
                <div className="w-12 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2A2F3A]/80 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 transform hover:scale-105 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-4xl md:text-5xl font-bold text-[#22C55E] mb-3">100+</div>
                <div className="text-[#FAFAFA] text-lg font-medium">daily positive responses requiring triage</div>
                <div className="w-12 h-1 bg-[#22C55E] mx-auto mt-4 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2A2F3A]/80 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 transform hover:scale-105 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-4xl md:text-5xl font-bold text-[#EF4444] mb-3">30+</div>
                <div className="text-[#FAFAFA] text-lg font-medium">weekly bookings needing qualification review</div>
                <div className="w-12 h-1 bg-[#EF4444] mx-auto mt-4 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Friction Points */}
        <div className="bg-[#2A2F3A]/60 rounded-3xl p-10 border-2 border-[#EF4444]/30 backdrop-blur-sm shadow-2xl">
          <h3 className="text-3xl font-bold mb-8 text-[#EF4444] flex items-center">
            <AlertTriangle className="w-8 h-8 mr-4 animate-pulse" />
            Current Friction Points
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/20">
                <Clock className="w-6 h-6 text-[#EF4444] mt-1 animate-pulse" />
                <div>
                  <h4 className="font-semibold text-[#FAFAFA] mb-1">Manual email triage</h4>
                  <p className="text-[#F4E4BC] text-sm">2–3 hours daily, draining team bandwidth</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/20">
                <Filter className="w-6 h-6 text-[#EF4444] mt-1 animate-pulse" />
                <div>
                  <h4 className="font-semibold text-[#FAFAFA] mb-1">Unqualified leads</h4>
                  <p className="text-[#F4E4BC] text-sm">30+ weekly bookings, wasting discovery time</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/20">
                <AlertTriangle className="w-6 h-6 text-[#EF4444] mt-1 animate-pulse" />
                <div>
                  <h4 className="font-semibold text-[#FAFAFA] mb-1">Post-call admin</h4>
                  <p className="text-[#F4E4BC] text-sm">NDAs, Typeforms, and emails slowing momentum</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/20">
                <CheckCircle className="w-6 h-6 text-[#EF4444] mt-1 animate-pulse" />
                <div>
                  <h4 className="font-semibold text-[#FAFAFA] mb-1">Approval bottlenecks</h4>
                  <p className="text-[#F4E4BC] text-sm">Jack/Jarrod reviews delaying deals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummary;
