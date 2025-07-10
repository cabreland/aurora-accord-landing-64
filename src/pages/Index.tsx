
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BusinessHero from '@/components/sections/BusinessHero';
import BusinessNavigation from '@/components/sections/BusinessNavigation';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import HowItWorks from '@/components/sections/HowItWorks';
import ReadyToExit from '@/components/sections/ReadyToExit';
import FAQ from '@/components/sections/FAQ';
import BusinessFooter from '@/components/sections/BusinessFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#1C2526] text-white">
      <BusinessNavigation />
      <BusinessHero />
      
      {/* Investor Portal Access */}
      <div className="py-16 px-4 bg-gradient-to-b from-[#1C2526] to-[#0A0F0F]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#FAFAFA] mb-4">
            Access Your Data Room
          </h2>
          <p className="text-xl text-[#F4E4BC] mb-8 max-w-2xl mx-auto">
            Secure portal for investors to access deal documents and manage investment opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold px-8 py-3 text-lg">
                Enter Data Room
              </Button>
            </Link>
            <Link to="/demo">
              <Button 
                variant="outline" 
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F] font-bold px-8 py-3 text-lg"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <TestimonialsSection />
      <HowItWorks />
      <ReadyToExit />
      <FAQ />
      <BusinessFooter />
    </div>
  );
};

export default Index;
