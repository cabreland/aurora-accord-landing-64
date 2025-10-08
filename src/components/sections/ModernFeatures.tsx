import React from 'react';
import { Shield, Zap, DollarSign, Clock, FileCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ModernFeatures = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Process",
      description: "Close your deal in 60 days or less with our streamlined process"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe & Secure",
      description: "Bank-level security and fully compliant escrow services"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "No Upfront Costs",
      description: "Zero fees until your business is sold successfully"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Quick Valuation",
      description: "Get your business valued in under 48 hours"
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Full Due Diligence",
      description: "We handle all paperwork and legal requirements"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Support",
      description: "Dedicated advisors guiding you every step of the way"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#0A0F0F] to-[#121212]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Fast, safe, and easy
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our proven process ensures a smooth transaction from start to finish
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 hover:border-[#D4AF37]/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center mb-4 text-[#D4AF37]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-black font-semibold px-8 py-6 text-lg rounded-full"
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ModernFeatures;
