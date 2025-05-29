
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TechStack = () => {
  const technologies = [
    { name: "Instantly", status: "Live" },
    { name: "GoHighLevel", status: "Enabled" },
    { name: "Gemini AI", status: "AI-Ready" },
    { name: "Slack", status: "Live" },
    { name: "Typeform", status: "Enabled" },
    { name: "Calendly", status: "Live" },
    { name: "Zapier", status: "AI-Ready" },
    { name: "Custom APIs", status: "Live" }
  ];

  return (
    <section className="py-20 bg-[#2A3B3C]/50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">Technology Stack</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <Card key={index} className="bg-[#1C2526] border-[#4A5D70] text-center hover:border-[#FFC107]/50 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-[#FFC107]/20 border-2 border-[#FFC107] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="text-2xl font-bold text-[#FFC107]">{tech.name.charAt(0)}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{tech.name}</h3>
                <Badge className={`
                  ${tech.status === 'Live' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}
                  ${tech.status === 'Enabled' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : ''}
                  ${tech.status === 'AI-Ready' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : ''}
                `}>
                  {tech.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
