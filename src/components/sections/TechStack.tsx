
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TechStack = () => {
  const technologies = [
    { name: "Instantly", status: "Live", color: "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30" },
    { name: "GoHighLevel", status: "Central Hub", color: "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30" },
    { name: "Calendly", status: "Enabled", color: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30" },
    { name: "Google Meet + Gemini", status: "AI-Ready", color: "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30" },
    { name: "Slack", status: "Live", color: "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30" },
    { name: "Typeform", status: "Enabled", color: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30" },
    { name: "DocuSign", status: "AI-Ready", color: "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30" },
    { name: "Apollo", status: "Enhanced", color: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30" }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#1A1F2E] to-[#0A0F0F] relative overflow-hidden">
      {/* Circuit Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="circuit-glow">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.2"/>
            </radialGradient>
          </defs>
          {/* Circuit Lines Connecting Tools */}
          <path d="M100,100 Q300,50 500,100 T900,100" stroke="url(#circuit-glow)" strokeWidth="2" fill="none">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="6s" repeatCount="indefinite"/>
          </path>
          <path d="M100,200 Q300,150 500,200 T900,200" stroke="url(#circuit-glow)" strokeWidth="2" fill="none">
            <animate attributeName="stroke-dasharray" values="1000,0;0,1000;1000,0" dur="8s" repeatCount="indefinite"/>
          </path>
          <circle cx="200" cy="150" r="3" fill="#D4AF37" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="400" cy="150" r="3" fill="#22C55E" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.5s"/>
          </circle>
          <circle cx="600" cy="150" r="3" fill="#3B82F6" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="1s"/>
          </circle>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            Technology Stack
          </h2>
          <p className="text-xl text-[#F4E4BC] max-w-3xl mx-auto mb-8">
            Integrated ecosystem of cutting-edge tools working in perfect harmony
          </p>
          
          {/* Integration Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#2A2F3A]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#22C55E]/30">
              <div className="text-3xl font-bold text-[#22C55E] mb-2">8</div>
              <div className="text-[#F4E4BC]">Core Integrations</div>
            </div>
            <div className="bg-[#2A2F3A]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/30">
              <div className="text-3xl font-bold text-[#D4AF37] mb-2">100%</div>
              <div className="text-[#F4E4BC]">API Coverage</div>
            </div>
            <div className="bg-[#2A2F3A]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#8B5CF6]/30">
              <div className="text-3xl font-bold text-[#8B5CF6] mb-2">Real-time</div>
              <div className="text-[#F4E4BC]">Data Sync</div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <Card key={index} className="bg-[#2A2F3A]/80 border-[#D4AF37]/30 text-center hover:border-[#D4AF37] transition-all duration-500 transform hover:scale-105 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20 group">
              <CardContent className="p-8 relative overflow-hidden">
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#D4AF37]/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  {/* Tech Logo Placeholder */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#F4E4BC]/10 border-2 border-[#D4AF37] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:shadow-[#D4AF37]/40 transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] bg-clip-text text-transparent">
                      {tech.name.charAt(0)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#FAFAFA] mb-3">{tech.name}</h3>
                  
                  <Badge className={`${tech.color} font-semibold`}>
                    {tech.status}
                  </Badge>
                  
                  {/* Connection Indicators */}
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse delay-300"></div>
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse delay-700"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Flow Diagram */}
        <div className="mt-16 text-center">
          <div className="bg-[#2A2F3A]/60 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#D4AF37]/30">
            <h3 className="text-2xl font-bold text-[#D4AF37] mb-6">Seamless Integration Flow</h3>
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-[#F4E4BC]">
              <span className="bg-[#22C55E]/20 px-4 py-2 rounded-lg border border-[#22C55E]/30">Instantly</span>
              <span className="text-[#D4AF37]">→</span>
              <span className="bg-[#D4AF37]/20 px-4 py-2 rounded-lg border border-[#D4AF37]/30">GHL</span>
              <span className="text-[#D4AF37]">→</span>
              <span className="bg-[#3B82F6]/20 px-4 py-2 rounded-lg border border-[#3B82F6]/30">Calendly</span>
              <span className="text-[#D4AF37]">→</span>
              <span className="bg-[#8B5CF6]/20 px-4 py-2 rounded-lg border border-[#8B5CF6]/30">Gemini AI</span>
              <span className="text-[#D4AF37]">→</span>
              <span className="bg-[#22C55E]/20 px-4 py-2 rounded-lg border border-[#22C55E]/30">Automated Actions</span>
            </div>
            <p className="text-[#F4E4BC] mt-4 text-sm">
              Real-time data flow ensures zero friction between platforms
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
