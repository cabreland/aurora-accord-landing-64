
import React from 'react';
import { Clock, Filter, AlertTriangle, Zap, Target, CheckCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ProblemsAndSolutions = () => {
  const problems = [
    { icon: Clock, title: "Manual email triage takes 2-3 hours daily", description: "Time-consuming lead qualification" },
    { icon: Filter, title: "90% unqualified leads clog pipeline", description: "Inefficient lead filtering" },
    { icon: AlertTriangle, title: "Inconsistent follow-up sequences", description: "Lost opportunities" }
  ];

  const solutions = [
    { icon: Zap, title: "AI-driven automation in <10 seconds", description: "100% automated triage" },
    { icon: Target, title: "90% unqualified leads filtered automatically", description: "Clean, qualified pipeline" },
    { icon: CheckCircle, title: "Consistent, personalized sequences", description: "Zero missed opportunities" }
  ];

  return (
    <section className="py-20 bg-[#1C2526]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">From Bottlenecks to Breakthroughs</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Problems */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-red-400 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3" />
              Current Problems
            </h3>
            {problems.map((problem, index) => (
              <Card key={index} className="bg-red-500/10 border-red-500/30 hover:border-red-400 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <problem.icon className="w-8 h-8 text-red-400 mt-1 animate-pulse" />
                    <div>
                      <h4 className="font-semibold text-white mb-2">{problem.title}</h4>
                      <p className="text-gray-300 text-sm">{problem.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Solutions */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#FFC107] mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 mr-3" />
              Our Solutions
            </h3>
            {solutions.map((solution, index) => (
              <Card key={index} className="bg-[#FFC107]/10 border-[#FFC107]/30 hover:border-[#FFC107] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <solution.icon className="w-8 h-8 text-[#FFC107] mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-2">{solution.title}</h4>
                      <p className="text-gray-300 text-sm">{solution.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemsAndSolutions;
