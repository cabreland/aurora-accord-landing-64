import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Handshake, FileCheck, TrendingUp, Users, DollarSign } from 'lucide-react';

const ProcessFlow = () => {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        {/* Main Title */}
        <h2 className="text-5xl md:text-6xl font-bold text-white text-center mb-8">
          Two Paths to Exit
        </h2>
        <p className="text-xl text-[#CCCCCC] text-center max-w-3xl mx-auto mb-20">
          Choose the path that works best for your business — fast acquisition or premium exit facilitation
        </p>
        
        {/* Two Paths Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          
          {/* PATH 1: Direct Acquisition */}
          <div className="bg-[#0A0A0A] border-2 border-[#C19A47] rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#C19A47]/20 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-[#C19A47]" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                We Buy Your Business
              </h3>
              <p className="text-[#C19A47] font-semibold text-lg">45-60 Day Close</p>
              <p className="text-[#999999] mt-2">Fast, direct acquisition by Next Tier Partners</p>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#C19A47] flex items-center justify-center text-black font-bold">
                    1
                  </div>
                  <div className="w-0.5 h-full bg-[#C19A47]/30 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="text-white font-semibold text-lg mb-1">Initial Assessment</h4>
                  <p className="text-[#CCCCCC] text-sm mb-2">Days 1-7</p>
                  <p className="text-[#999999]">Submit business details, receive preliminary valuation and acquisition interest confirmation</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#C19A47] flex items-center justify-center text-black font-bold">
                    2
                  </div>
                  <div className="w-0.5 h-full bg-[#C19A47]/30 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="text-white font-semibold text-lg mb-1">Due Diligence</h4>
                  <p className="text-[#CCCCCC] text-sm mb-2">Days 8-30</p>
                  <p className="text-[#999999]">Financial review, operational assessment, technical audit, and legal verification</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#C19A47] flex items-center justify-center text-black font-bold">
                    3
                  </div>
                  <div className="w-0.5 h-full bg-[#C19A47]/30 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="text-white font-semibold text-lg mb-1">Offer & Terms</h4>
                  <p className="text-[#CCCCCC] text-sm mb-2">Days 31-40</p>
                  <p className="text-[#999999]">Formal offer presentation, deal structure negotiation, payment terms finalization</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#C19A47] flex items-center justify-center text-black font-bold">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-1">Close & Transfer</h4>
                  <p className="text-[#CCCCCC] text-sm mb-2">Days 41-60</p>
                  <p className="text-[#999999]">Legal documentation, asset transfer, funds disbursement, smooth handoff</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2D2D2D]">
              <Button className="w-full bg-[#C19A47] hover:bg-[#D4AF5F] text-black font-semibold py-6 rounded-full text-lg">
                Get Acquisition Offer
              </Button>
            </div>
          </div>

          {/* PATH 2: Exit Facilitation */}
          <div className="bg-[#0A0A0A] border-2 border-[#999999] rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#999999]/20 flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-[#999999]" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Premium Exit Facilitation
              </h3>
              <p className="text-[#999999] font-semibold text-lg">60-90 Day Close</p>
              <p className="text-[#999999] mt-2">Matched with qualified buyers from our network</p>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#999999] flex items-center justify-center text-black font-bold">
                    1
                  </div>
                  <div className="w-0.5 h-full bg-[#999999]/30 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="text-white font-semibold text-lg mb-1">Business Preparation</h4>
                  <p className="text-[#CCCCCC] text-sm mb-2">Days 1-14</p>
                  <p className="text-[#999999]">Valuation analysis, CIM creation, buyer profile development, confidential marketing materials</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#999999] flex items-center justify-center text-black font-bold">
                    2
                  </div>
                  <div className="w-0.5 h-full bg-[#999999]/30 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="text-white font-semibold text-lg mb-1">Buyer Matching</h4>
                  <p className="text-[#CCCCCC] text-sm mb-2">Days 15-35</p>
                  <p className="text-[#999999]">Strategic outreach to qualified buyers, NDA execution, initial interest gauging</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#999999] flex items-center justify-center text-black font-bold">
                    3
                  </div>
                  <div className="w-0.5 h-full bg-[#999999]/30 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="text-white font-semibold text-lg mb-1">Negotiation Support</h4>
                  <p className="text-[#CCCCCC] text-sm mb-2">Days 36-60</p>
                  <p className="text-[#999999]">LOI negotiation, buyer due diligence coordination, deal structure optimization</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#999999] flex items-center justify-center text-black font-bold">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-1">Transaction Close</h4>
                  <p className="text-[#CCCCCC] text-sm mb-2">Days 61-90</p>
                  <p className="text-[#999999]">Purchase agreement finalization, escrow management, closing coordination, post-close support</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2D2D2D]">
              <Button className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-6 rounded-full text-lg">
                Start Exit Process
              </Button>
            </div>
          </div>
          
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-[#CCCCCC] mb-6 text-lg">
            Not sure which path is right for you?
          </p>
          <Button className="bg-[#C19A47] hover:bg-[#D4AF5F] text-black font-bold px-12 py-4 text-lg rounded-full">
            Get Your Free Valuation →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProcessFlow;