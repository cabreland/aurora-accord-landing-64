import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const FAQ = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] relative overflow-hidden">
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-6">
          <AccordionItem value="item-1" className="bg-[#2A2F3A]/60 border-[#D4AF37]/30 rounded-lg px-6 backdrop-blur-sm">
            <AccordionTrigger className="text-[#FAFAFA] hover:text-[#D4AF37] text-lg font-semibold py-6">
              What is your fee structure?
            </AccordionTrigger>
            <AccordionContent className="text-[#F4E4BC] pb-6 text-base leading-relaxed">
              We work on a success-only basis with no upfront costs. Our fee is competitive and only paid at closing, including all legal and escrow fees. We believe in aligning our success with yours.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-[#2A2F3A]/60 border-[#D4AF37]/30 rounded-lg px-6 backdrop-blur-sm">
            <AccordionTrigger className="text-[#FAFAFA] hover:text-[#D4AF37] text-lg font-semibold py-6">
              What do I get when I work with you?
            </AccordionTrigger>
            <AccordionContent className="text-[#F4E4BC] pb-6 text-base leading-relaxed">
              You get a dedicated team managing your entire sale process, access to our qualified buyer network, professional business valuation, marketing materials, legal support, escrow services, and hands-on guidance from listing to closing.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-[#2A2F3A]/60 border-[#D4AF37]/30 rounded-lg px-6 backdrop-blur-sm">
            <AccordionTrigger className="text-[#FAFAFA] hover:text-[#D4AF37] text-lg font-semibold py-6">
              What types of buyers will I have access to?
            </AccordionTrigger>
            <AccordionContent className="text-[#F4E4BC] pb-6 text-base leading-relaxed">
              Our buyer network includes qualified individual investors, private equity groups, strategic acquirers, and entrepreneurs looking for cash-flowing businesses. All buyers are pre-screened and financially qualified.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="bg-[#2A2F3A]/60 border-[#D4AF37]/30 rounded-lg px-6 backdrop-blur-sm">
            <AccordionTrigger className="text-[#FAFAFA] hover:text-[#D4AF37] text-lg font-semibold py-6">
              Can you guarantee that my business will sell?
            </AccordionTrigger>
            <AccordionContent className="text-[#F4E4BC] pb-6 text-base leading-relaxed">
              While we can't guarantee a sale, we have a strong track record of successful transactions. We only take on businesses we're confident we can sell, and our qualification process ensures we're a good fit before we begin.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="bg-[#2A2F3A]/60 border-[#D4AF37]/30 rounded-lg px-6 backdrop-blur-sm">
            <AccordionTrigger className="text-[#FAFAFA] hover:text-[#D4AF37] text-lg font-semibold py-6">
              How do I get started?
            </AccordionTrigger>
            <AccordionContent className="text-[#F4E4BC] pb-6 text-base leading-relaxed">
              Simply book a call with our team. We'll discuss your business, timeline, and goals to determine if we're a good fit. If so, we'll begin the qualification process and get your business ready for market.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="text-center mt-16">
          <Button 
            onClick={() => window.open('https://calendly.com/your-calendar-link', '_blank')}
            className="relative bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] hover:from-[#F4E4BC] hover:to-[#D4AF37] text-[#0A0F0F] font-bold px-12 py-6 text-xl transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#D4AF37]/40 border-2 border-[#D4AF37] overflow-hidden group"
          >
            <span className="relative z-10">Book a Call Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;