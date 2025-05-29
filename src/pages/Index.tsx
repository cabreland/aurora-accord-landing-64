
import React from 'react';
import Navigation from '@/components/sections/Navigation';
import Hero from '@/components/sections/Hero';
import ExecutiveSummary from '@/components/sections/ExecutiveSummary';
import ProblemsAndSolutions from '@/components/sections/ProblemsAndSolutions';
import FrameworkOverview from '@/components/sections/FrameworkOverview';
import PhaseBreakdown from '@/components/sections/PhaseBreakdown';
import SuccessMetrics from '@/components/sections/SuccessMetrics';
import Timeline from '@/components/sections/Timeline';
import TechStack from '@/components/sections/TechStack';
import InvestmentCTA from '@/components/sections/InvestmentCTA';
import Footer from '@/components/sections/Footer';

const Index = () => {
  const scrollToExecutiveSummary = () => {
    document.getElementById('executive-summary')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#1C2526] text-white">
      <Navigation />
      <Hero onScrollToPhases={scrollToExecutiveSummary} />
      <ExecutiveSummary />
      <ProblemsAndSolutions />
      <FrameworkOverview />
      <PhaseBreakdown />
      <SuccessMetrics />
      <Timeline />
      <TechStack />
      <InvestmentCTA />
      <Footer />
    </div>
  );
};

export default Index;
