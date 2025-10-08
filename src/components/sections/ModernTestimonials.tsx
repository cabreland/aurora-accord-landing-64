import React from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const ModernTestimonials = () => {
  const testimonials = [
    {
      company: "FINNOVA",
      logo: "F",
      text: "Outstanding service from start to finish. They handled everything professionally and got us a great deal. The entire process was transparent and efficient.",
      author: "Michael Chen",
      role: "CEO"
    },
    {
      company: "DATAFLOW",
      logo: "D",
      text: "We were skeptical about the 60-day timeline, but they delivered. Our business sold in 58 days at a valuation that exceeded our expectations.",
      author: "Emma Rodriguez",
      role: "Founder"
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#0A0F0F]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What our partners say
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it - hear from business owners who've worked with us
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center text-black font-bold text-xl">
                  {testimonial.logo}
                </div>
                <div className="text-xl font-bold text-white">
                  {testimonial.company}
                </div>
              </div>

              <blockquote className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.text}"
              </blockquote>

              <div className="border-t border-gray-800 pt-4">
                <div className="font-semibold text-white">{testimonial.author}</div>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-black font-semibold px-8 py-6 text-lg rounded-full"
          >
            Read More Success Stories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ModernTestimonials;
