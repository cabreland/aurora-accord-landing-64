import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ModernFAQ = () => {
  const faqs = [
    {
      question: "How long does it take to sell my business?",
      answer: "Our average timeline is 45-60 days from initial consultation to closing. This includes valuation, marketing, buyer qualification, due diligence, and final transaction."
    },
    {
      question: "What types of businesses do you work with?",
      answer: "We specialize in digital businesses including SaaS companies, e-commerce stores, content sites, mobile apps, and online marketplaces with revenue between $100K-$10M annually."
    },
    {
      question: "How do you determine the value of my business?",
      answer: "We use multiple valuation methods including revenue multiples, EBITDA multiples, asset-based valuation, and comparable sales analysis to determine fair market value."
    },
    {
      question: "What are your fees?",
      answer: "We work on a success-based model with no upfront costs. Our fee is a percentage of the final sale price, only paid when your business successfully sells."
    },
    {
      question: "Do I need to prepare anything before starting?",
      answer: "We'll guide you through the preparation process, but having clean financial records, customer data, and operational documentation ready will help expedite the process."
    },
    {
      question: "How do you find qualified buyers?",
      answer: "We maintain a network of over 5,000 pre-qualified buyers and use targeted marketing, industry connections, and proprietary databases to find the right match for your business."
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#121212] to-[#0A0F0F]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-400">
            Everything you need to know about selling your business
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-6 data-[state=open]:border-[#D4AF37]/50"
            >
              <AccordionTrigger className="text-white hover:text-[#D4AF37] text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center">
          <Button 
            className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-black font-semibold px-8 py-6 text-lg rounded-full"
          >
            Still Have Questions? Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ModernFAQ;
