import React from 'react';
import { Settings, Rocket, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Timeline = () => {
  const timelineItems = [
    { 
      week: "Week 1", 
      title: "Kickoff & Prioritization", 
      icon: Settings,
      description: "Discuss priorities, set up Instantly → GHL integration, configure sentiment tagging",
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
      borderColor: "border-[#D4AF37]/30"
    },
    { 
      week: "Week 2", 
      title: "Core Automation Rollout", 
      icon: Rocket,
      description: "Gemini integration for calls, buyer outreach automation, team training",
      color: "text-[#22C55E]",
      bgColor: "bg-[#22C55E]/10",
      borderColor: "border-[#22C55E]/30"
    },
    { 
      week: "Week 3", 
      title: "Optimization & Expansion", 
      icon: TrendingUp,
      description: "Monitor automations, add enhancements (e.g., proof-of-funds), plan next phases",
      color: "text-[#F4E4BC]",
      bgColor: "bg-[#F4E4BC]/10",
      borderColor: "border-[#F4E4BC]/30"
    },
    { 
      week: "Week 4", 
      title: "Full Deployment & Support", 
      icon: CheckCircle2,
      description: "Complete implementation, documentation handoff, 30-day optimization support begins",
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
      borderColor: "border-[#D4AF37]/30"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8"/>
              <stop offset="33%" stopColor="#22C55E" stopOpacity="0.6"/>
              <stop offset="66%" stopColor="#F4E4BC" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
          <path d="M0,300 Q200,200 400,300 T800,300" stroke="url(#timeline-gradient)" strokeWidth="4" fill="none">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="10s" repeatCount="indefinite"/>
          </path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#D4AF37] via-[#22C55E] to-[#F4E4BC] bg-clip-text text-transparent">
            Implementation Timeline
          </h2>
          <p className="text-xl text-[#F4E4BC] max-w-3xl mx-auto">
            Strategic 2-3 week rollout designed for minimal disruption and maximum impact
          </p>
        </div>
        
        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Timeline Line */}
          <div className="absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#22C55E] to-[#F4E4BC] rounded-full"></div>
          
          <div className="grid grid-cols-4 gap-8">
            {timelineItems.map((item, index) => (
              <div key={index} className="relative">
                {/* Timeline Node */}
                <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 w-8 h-8 ${item.bgColor} ${item.borderColor} border-4 rounded-full ${item.color} flex items-center justify-center shadow-lg animate-pulse`}>
                  <div className="w-3 h-3 bg-current rounded-full"></div>
                </div>
                
                <Card className={`mt-32 ${item.bgColor} ${item.borderColor} border-2 hover:border-opacity-100 transition-all duration-500 transform hover:scale-105 backdrop-blur-sm shadow-xl`}>
                  <CardContent className="p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-current/5 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative z-10">
                      <item.icon className={`w-12 h-12 ${item.color} mx-auto mb-4`} />
                      <h3 className={`text-xl font-bold ${item.color} mb-2`}>{item.week}</h3>
                      <h4 className="text-lg font-semibold text-[#FAFAFA] mb-3">{item.title}</h4>
                      <p className="text-[#F4E4BC] text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-8">
          {timelineItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-6">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 ${item.bgColor} ${item.borderColor} border-4 rounded-full ${item.color} flex items-center justify-center shadow-lg animate-pulse`}>
                  <item.icon className="w-6 h-6" />
                </div>
                {index < timelineItems.length - 1 && (
                  <div className={`w-1 h-24 ${item.bgColor} mt-4 rounded-full`}></div>
                )}
              </div>
              
              <Card className={`flex-1 ${item.bgColor} ${item.borderColor} border-2 hover:border-opacity-100 transition-all duration-300 backdrop-blur-sm shadow-lg`}>
                <CardContent className="p-6">
                  <h3 className={`text-lg font-bold ${item.color} mb-1`}>{item.week}</h3>
                  <h4 className="text-lg font-semibold text-[#FAFAFA] mb-3">{item.title}</h4>
                  <p className="text-[#F4E4BC] text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-[#2A2F3A]/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#D4AF37]/30">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E] animate-pulse" />
            <div>
              <h3 className="text-[#FAFAFA] text-lg font-semibold mb-1">Ready to accelerate your M&A operations?</h3>
              <p className="text-[#F4E4BC] text-sm">Implementation begins immediately after kickoff</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
