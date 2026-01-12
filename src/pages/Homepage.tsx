import React from 'react';
import {
  CleanNavigation,
  HeroSection,
  LogoStrip,
  ComparisonSection,
  PlatformSection,
  TestimonialsSection,
  CTASection,
  CleanFooter,
} from '@/components/homepage';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Navigation */}
      <CleanNavigation />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Logo Strip */}
      <LogoStrip />
      
      {/* Say goodbye to painful execution - Comparison Section */}
      <ComparisonSection />
      
      {/* Platform Section - Purpose Built for M&A */}
      <PlatformSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Footer */}
      <CleanFooter />
    </div>
  );
};

export default Homepage;
