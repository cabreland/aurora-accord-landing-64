import React from 'react';
import { TrendingUp } from 'lucide-react';

const ModernMetrics = () => {
  const metrics = [
    { value: "$300M+", label: "Total Transaction Value", description: "Across all deals" },
    { value: "2,000+", label: "Businesses Sold", description: "Since 2018" },
    { value: "$500K+", label: "Average Deal Size", description: "Higher than industry average" },
    { value: "$36+", label: "Average Multiple", description: "Best-in-class valuations" }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#121212] to-[#0A0F0F]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Proven by metrics
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our track record speaks for itself
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-8 text-center hover:border-[#D4AF37]/50 transition-all duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold text-[#D4AF37] mb-2">
                {metric.value}
              </div>
              <div className="text-lg font-semibold text-white mb-1">
                {metric.label}
              </div>
              <div className="text-sm text-gray-400">
                {metric.description}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#252525] border border-gray-800 rounded-2xl p-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <blockquote className="text-white text-lg mb-4">
                "The team helped us achieve a valuation 40% higher than we expected and closed the deal in just 52 days. Their expertise in digital business sales is unmatched."
              </blockquote>
              <div className="text-[#D4AF37] font-semibold">Sarah Johnson</div>
              <div className="text-gray-400 text-sm">Founder, TechFlow SaaS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernMetrics;
