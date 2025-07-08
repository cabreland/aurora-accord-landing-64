
import React from 'react';
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
      <TestimonialsSection />
      <HowItWorks />
      <ReadyToExit />
      <FAQ />
      <BusinessFooter />
    </div>
  );
};

export default Index;
