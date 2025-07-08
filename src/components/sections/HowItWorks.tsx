import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] relative overflow-hidden">
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            How Does It Work?
          </h2>
        </div>

        <div className="space-y-8">
          {/* Step 1 - Qualify */}
          <Card className="bg-[#2A2F3A]/60 border-2 border-[#D4AF37] hover:border-[#F4E4BC] transition-all duration-300 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-10">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#D4AF37] mb-4">Qualify</h3>
                <p className="text-[#FAFAFA] text-lg leading-relaxed max-w-4xl mx-auto">
                  We do a brief assessment to determine if your business is a fit for our buyer network. We only work with businesses we are confident we can sell.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 - Prepare */}
          <Card className="bg-[#2A2F3A]/60 border-2 border-[#D4AF37] hover:border-[#F4E4BC] transition-all duration-300 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-10">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#D4AF37] mb-4">Prepare</h3>
                <p className="text-[#FAFAFA] text-lg leading-relaxed max-w-4xl mx-auto">
                  We help you determine a valuation and get your listing package together. We request that clients come prepared with financials and key business metrics.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 - Close */}
          <Card className="bg-[#2A2F3A]/60 border-2 border-[#D4AF37] hover:border-[#F4E4BC] transition-all duration-300 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-10">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#D4AF37] mb-4">Close</h3>
                <p className="text-[#FAFAFA] text-lg leading-relaxed max-w-4xl mx-auto">
                  We introduce you to serious, qualified buyers and provide you with a full-service to complete your transaction fast and reliable, including legal and escrow.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;