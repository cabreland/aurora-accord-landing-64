
import React from 'react';
import { Clock, Filter, AlertTriangle, Zap, Target, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ProblemsAndSolutions = () => {
  const comparisons = [
    {
      problem: {
        icon: Clock,
        title: "Manual email triage takes 2–3 hours daily",
        description: "Team bandwidth drained by repetitive tasks",
        color: "text-[#EF4444]",
        bgColor: "bg-[#EF4444]/10",
        borderColor: "border-[#EF4444]/30"
      },
      solution: {
        icon: Zap,
        title: "AI-driven automation processes 100+ responses in <10 seconds",
        description: "100% automated triage with <5% error rate",
        color: "text-[#D4AF37]",
        bgColor: "bg-[#D4AF37]/10",
        borderColor: "border-[#D4AF37]/30"
      }
    },
    {
      problem: {
        icon: Filter,
        title: "Unqualified leads clog the pipeline (30+ weekly)",
        description: "Wasted time on discovery calls",
        color: "text-[#EF4444]",
        bgColor: "bg-[#EF4444]/10",
        borderColor: "border-[#EF4444]/30"
      },
      solution: {
        icon: Target,
        title: "Auto-filter 90% of unqualified leads with smart routing",
        description: "Only high-potential prospects reach discovery",
        color: "text-[#D4AF37]",
        bgColor: "bg-[#D4AF37]/10",
        borderColor: "border-[#D4AF37]/30"
      }
    },
    {
      problem: {
        icon: AlertTriangle,
        title: "Post-call admin delays deals (30 min/call)",
        description: "NDAs, Typeforms slow momentum",
        color: "text-[#EF4444]",
        bgColor: "bg-[#EF4444]/10",
        borderColor: "border-[#EF4444]/30"
      },
      solution: {
        icon: CheckCircle,
        title: "Automate NDAs and Typeforms in <5 seconds",
        description: "Instant post-call workflow execution",
        color: "text-[#D4AF37]",
        bgColor: "bg-[#D4AF37]/10",
        borderColor: "border-[#D4AF37]/30"
      }
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#1A1F2E] to-[#0A0F0F] relative overflow-hidden">
      {/* Animated Background Circuit */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuit-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
          <path d="M0,200 Q200,100 400,200 T800,200" stroke="url(#circuit-flow)" strokeWidth="3" fill="none">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="8s" repeatCount="indefinite"/>
          </path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-[#EF4444] via-[#D4AF37] to-[#22C55E] bg-clip-text text-transparent">
          From Bottlenecks to Breakthroughs
        </h2>
        <p className="text-xl text-[#F4E4BC] text-center mb-16 max-w-3xl mx-auto">
          Transforming manual processes into intelligent automation workflows
        </p>
        
        <div className="space-y-12">
          {comparisons.map((comparison, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 hidden lg:block">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-px bg-gradient-to-r from-[#EF4444] to-[#D4AF37] animate-pulse"></div>
                  <ArrowRight className="w-8 h-8 text-[#D4AF37] animate-bounce" />
                  <div className="w-24 h-px bg-gradient-to-r from-[#D4AF37] to-[#22C55E] animate-pulse"></div>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 relative z-10">
                {/* Problem */}
                <Card className={`${comparison.problem.bgColor} ${comparison.problem.borderColor} border-2 hover:border-[#EF4444] transition-all duration-500 transform hover:scale-105 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-[#EF4444]/20`}>
                  <CardContent className="p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#EF4444]/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-[#EF4444]/20 rounded-xl">
                          <comparison.problem.icon className={`w-8 h-8 ${comparison.problem.color} animate-pulse`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#FAFAFA] mb-3 text-lg leading-tight">{comparison.problem.title}</h4>
                          <p className="text-[#F4E4BC] text-sm leading-relaxed">{comparison.problem.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Solution */}
                <Card className={`${comparison.solution.bgColor} ${comparison.solution.borderColor} border-2 hover:border-[#D4AF37] transition-all duration-500 transform hover:scale-105 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20`}>
                  <CardContent className="p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-[#D4AF37]/20 rounded-xl">
                          <comparison.solution.icon className={`w-8 h-8 ${comparison.solution.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#FAFAFA] mb-3 text-lg leading-tight">{comparison.solution.title}</h4>
                          <p className="text-[#F4E4BC] text-sm leading-relaxed">{comparison.solution.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-[#2A2F3A]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/30">
            <Lightbulb className="w-8 h-8 text-[#D4AF37] animate-pulse" />
            <span className="text-[#FAFAFA] text-lg font-medium">Ready to eliminate these bottlenecks?</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemsAndSolutions;
