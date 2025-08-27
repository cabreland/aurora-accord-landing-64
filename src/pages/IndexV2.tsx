import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import VideoHero from '@/components/sections/VideoHero';
import ProcessFlow from '@/components/sections/ProcessFlow';
import BusinessNavigation from '@/components/sections/BusinessNavigation';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ReadyToExit from '@/components/sections/ReadyToExit';
import FAQ from '@/components/sections/FAQ';
import BusinessFooter from '@/components/sections/BusinessFooter';

const IndexV2 = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <BusinessNavigation />
      <VideoHero />
      <ProcessFlow />
      
      <TestimonialsSection />
      <ReadyToExit />
      <FAQ />
      <BusinessFooter />
    </div>
  );
};

export default IndexV2;