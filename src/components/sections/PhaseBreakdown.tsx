
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, Target, Brain, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PhaseBreakdown = () => {
  const [expandedPhases, setExpandedPhases] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <section id="phases" className="py-20 bg-[#1C2526]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">Implementation Phases</h2>
        
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((phase) => (
            <Card key={phase} className="bg-[#2A3B3C] border-[#FFC107]/30 overflow-hidden hover:border-[#FFC107] transition-all duration-300 hover:shadow-lg hover:shadow-[#FFC107]/20">
              <CardHeader 
                className="cursor-pointer hover:bg-[#FFC107]/10 transition-colors"
                onClick={() => togglePhase(phase)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
                      {phase}
                    </div>
                    <CardTitle className="text-xl text-white">Phase {phase} - [Title Placeholder]</CardTitle>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-[#4A5D70]"></div>
                      <div className="w-3 h-3 bg-[#FFC107] rounded-full"></div>
                    </div>
                  </div>
                  {expandedPhases.includes(phase) ? (
                    <ChevronDown className="w-5 h-5 text-[#FFC107]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#FFC107]" />
                  )}
                </div>
              </CardHeader>
              
              {expandedPhases.includes(phase) && (
                <CardContent className="border-t border-[#4A5D70] animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-8 pt-6">
                    <div>
                      <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Quick Wins
                      </h4>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-[#FFC107] mr-2" />
                          [Quick Win 1 - Content Placeholder]
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-[#FFC107] mr-2" />
                          [Quick Win 2 - Content Placeholder]
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-[#FFC107] mr-2" />
                          [Quick Win 3 - Content Placeholder]
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-[#FFC107] mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Why It Matters
                      </h4>
                      <div className="bg-[#FFC107]/10 border border-[#FFC107]/30 p-4 rounded-lg">
                        <p className="text-gray-300 leading-relaxed">
                          [Strategic explanation paragraph - Content Placeholder. This section will explain the strategic purpose and long-term impact of this phase.]
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-[#4A5D70]">
                    <button
                      onClick={() => toggleSection(`smart-${phase}`)}
                      className="flex items-center text-blue-400 hover:text-[#FFC107] transition-colors"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Smart Layers
                      {expandedSections.includes(`smart-${phase}`) ? (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-2" />
                      )}
                    </button>
                    
                    {expandedSections.includes(`smart-${phase}`) && (
                      <div className="mt-4 pl-6 border-l-2 border-[#FFC107]/30 animate-fade-in">
                        <ul className="space-y-2 text-gray-300">
                          <li>• [Advanced automation feature 1]</li>
                          <li>• [Advanced automation feature 2]</li>
                          <li>• [Advanced automation feature 3]</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhaseBreakdown;
