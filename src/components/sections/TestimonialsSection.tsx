import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle } from 'lucide-react';

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-[#1A1F2E] to-[#0A0F0F] relative overflow-hidden">
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            Seller Testimonials
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Testimonial 1 */}
          <Card className="bg-[#2A2F3A]/80 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-32 h-24 bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] rounded-lg flex items-center justify-center border border-[#D4AF37]/30">
                    <Play className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#FAFAFA] mb-1">
                      Bishoi | <span className="text-[#D4AF37]">mytruwood.com</span>
                    </h3>
                  </div>
                  <p className="text-[#F4E4BC] mb-4 leading-relaxed">
                    "With the other platforms it almost felt like they were just trying to get the sale closed at whatever price the buyer could. They actually recommended that I drop my price a few times..."
                  </p>
                  <p className="text-[#F4E4BC] mb-6 leading-relaxed">
                    "You guys got me a way better valuation and I still sold the business in less time than I spent on the other platforms"
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-[#F4E4BC] text-sm">Saved $100k in closing fees</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-[#F4E4BC] text-sm">Sold above asking price</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-[#F4E4BC] text-sm">LOI by week 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial 2 */}
          <Card className="bg-[#2A2F3A]/80 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-32 h-24 bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] rounded-lg flex items-center justify-center border border-[#D4AF37]/30">
                    <Play className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#FAFAFA] mb-1">
                      Brad | <span className="text-[#D4AF37]">stretchcoach.com</span>
                    </h3>
                  </div>
                  <p className="text-[#F4E4BC] mb-4 leading-relaxed">
                    "Every time I had a transaction or an issue you guys were there to take care of it, you really walked me through the deal..."
                  </p>
                  <p className="text-[#F4E4BC] mb-6 leading-relaxed">
                    "When I saw your fee I was a bit hesitant but having gone through the deal I'm so happy it was done that way."
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-[#F4E4BC] text-sm">Saved $75k in closing fees</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-[#F4E4BC] text-sm">Custom tailored legal support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-[#F4E4BC] text-sm">Zero seller financing</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;