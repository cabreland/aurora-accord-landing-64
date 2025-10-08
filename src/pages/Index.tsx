import React from 'react';
import ModernNavigation from '@/components/sections/ModernNavigation';
import ModernHero from '@/components/sections/ModernHero';
import ModernFeatures from '@/components/sections/ModernFeatures';
import ModernProcess from '@/components/sections/ModernProcess';
import ModernMetrics from '@/components/sections/ModernMetrics';
import ModernTestimonials from '@/components/sections/ModernTestimonials';
import ModernBlog from '@/components/sections/ModernBlog';
import ModernFAQ from '@/components/sections/ModernFAQ';
import ModernFooter from '@/components/sections/ModernFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0A0F0F] text-white">
      <ModernNavigation />
      <ModernHero />
      <ModernFeatures />
      <ModernProcess />
      <ModernMetrics />
      <ModernTestimonials />
      <ModernBlog />
      <ModernFAQ />
      <ModernFooter />
    </div>
  );
};

export default Index;
