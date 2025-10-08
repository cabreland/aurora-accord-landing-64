import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ModernProcess = () => {
  const steps = [
    { title: "Initial Consultation", description: "Free 30-minute call to discuss your business" },
    { title: "Business Valuation", description: "Professional valuation within 48 hours" },
    { title: "Marketing Materials", description: "Create compelling listing and materials" },
    { title: "Buyer Outreach", description: "Connect with our network of qualified buyers" },
    { title: "Due Diligence", description: "Handle all legal and financial reviews" },
    { title: "Close the Deal", description: "Finalize transaction and transfer ownership" }
  ];

  return (
    <section className="py-20 px-4 bg-[#121212]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trust our sales process
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A proven 6-step framework that has helped sell over 2,000 businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-sm text-[#D4AF37] font-semibold mb-1">
                    Step {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-black font-semibold px-8 py-6 text-lg rounded-full"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ModernProcess;
