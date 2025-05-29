
import React from 'react';
import { DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InvestmentCTA = () => {
  return (
    <section id="investment" className="py-20 bg-gradient-to-r from-[#1C2526] via-[#2A3B3C] to-[#1C2526]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-8 text-[#FFC107]">Ready to Transform Your M&A Operations?</h2>
        
        <div className="bg-[#2A3B3C] rounded-lg p-8 border border-[#FFC107]/30 mb-8 shadow-lg shadow-[#FFC107]/10">
          <div className="flex items-center justify-center mb-6">
            <DollarSign className="w-8 h-8 text-[#FFC107] mr-2" />
            <span className="text-6xl font-bold text-[#FFC107]">$3,000</span>
          </div>
          <p className="text-xl text-gray-300 mb-6">Complete Implementation Package</p>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                All 8 implementation phases
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                Custom automation logic
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                Tool integration & setup
              </li>
            </ul>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                Team training & documentation
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                30-day optimization support
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                Performance monitoring setup
              </li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold px-12 py-6 text-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
            Ready to Start? Let's Confirm Your Kickoff
          </Button>
          <p className="text-gray-400">
            Schedule your implementation kickoff call
          </p>
        </div>
      </div>
    </section>
  );
};

export default InvestmentCTA;
