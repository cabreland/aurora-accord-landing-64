
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Target, Zap, Brain, CheckCircle, Clock, DollarSign, Users, TrendingUp, AlertTriangle, Filter, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
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

  const scrollToPhases = () => {
    document.getElementById('phases')?.scrollIntoView({ behavior: 'smooth' });
  };

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
    <div className="min-h-screen bg-[#1C2526] text-white">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 w-full bg-[#FFC107] text-black z-50 px-6 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="font-bold text-lg">M&A Automation Strategy</div>
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline">Overview</button>
            <button onClick={() => document.getElementById('phases')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline">Phases</button>
            <button onClick={() => document.getElementById('metrics')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline">Metrics</button>
            <button onClick={() => document.getElementById('investment')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline">Investment</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1C2526] via-[#2A3B3C] to-[#1C2526] pt-16">
        {/* Hexagonal Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-16 h-16 border-2 border-[#FFC107] transform rotate-45"></div>
          <div className="absolute top-40 right-32 w-12 h-12 border-2 border-[#FFC107] transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-[#FFC107] transform rotate-45"></div>
          <div className="absolute bottom-20 right-20 w-14 h-14 border-2 border-[#FFC107] transform rotate-45 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/lovable-uploads/a70012ca-4619-4635-9f2c-e23113854a06.png" 
              alt="Exclusive Business Brokers" 
              className="w-32 h-32 mx-auto mb-6 filter brightness-0 invert"
            />
            <Badge className="bg-[#FFC107] text-black border-[#FFC107] mb-6 text-sm font-semibold px-4 py-2">
              M&A Automation Strategy & Implementation Proposal
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Transforming M&A with </span>
            <span className="text-[#FFC107] relative">
              Automation
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFC107] animate-pulse"></div>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto font-light italic">
            Built for Jack's team. Powered by AI. Designed to scale.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={scrollToPhases}
              className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Jump to Plan
            </Button>
            <Button 
              variant="outline" 
              className="border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-black px-8 py-4 text-lg transition-all duration-200"
            >
              Executive Summary
            </Button>
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-20 bg-[#2A3B3C]/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 text-[#FFC107]">Executive Summary</h2>
            <div className="bg-gradient-to-r from-[#FFC107]/20 to-transparent p-6 rounded-lg border border-[#FFC107]/30 mb-8">
              <p className="text-lg italic text-[#FFC107] font-medium">
                "Built from Jack's SOP Notes"
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-[#1C2526] border-[#4A5D70] hover:border-[#FFC107] transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[#FFC107] mb-2">140K</div>
                <div className="text-gray-300">Emails/Month</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1C2526] border-[#4A5D70] hover:border-[#FFC107] transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[#FFC107] mb-2">1,000</div>
                <div className="text-gray-300">Inboxes</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1C2526] border-[#4A5D70] hover:border-[#FFC107] transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[#FFC107] mb-2">85%</div>
                <div className="text-gray-300">Manual Tasks</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#1C2526] rounded-lg p-8 border border-[#4A5D70]">
            <h3 className="text-2xl font-semibold mb-4 text-[#FFC107]">Current Friction Points</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                Manual lead qualification across multiple platforms
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                Inconsistent follow-up sequences
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                Disconnected buyer and seller workflows
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                Time-intensive post-sale processes
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Problems & Solutions Visual */}
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

      {/* Framework Key */}
      <section className="py-20 bg-[#2A3B3C]/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">Framework Overview</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#1C2526] border-[#4A5D70] hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-green-400">Quick Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">Easy, fast ROI implementations that deliver immediate value</p>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mt-4 mx-auto block w-fit">
                  Fast ROI
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-[#1C2526] border-[#4A5D70] hover:border-[#FFC107]/50 transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <Target className="w-12 h-12 text-[#FFC107] mx-auto mb-4" />
                <CardTitle className="text-[#FFC107]">Why It Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">Strategic purpose and long-term impact explanations</p>
                <Badge className="bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]/30 mt-4 mx-auto block w-fit">
                  Strategic Value
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-[#1C2526] border-[#4A5D70] hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-blue-400">Smart Layers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">Advanced automation systems designed for scale</p>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mt-4 mx-auto block w-fit">
                  AI-Powered
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Phase Breakdown */}
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

      {/* Success Metrics */}
      <section id="metrics" className="py-20 bg-[#2A3B3C]/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">Success Metrics</h2>
          
          <div className="bg-[#1C2526] rounded-lg overflow-hidden border border-[#4A5D70]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FFC107]/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-[#FFC107] font-semibold">Manual Task</th>
                    <th className="px-6 py-4 text-left text-red-300 font-semibold">Current Time</th>
                    <th className="px-6 py-4 text-left text-green-300 font-semibold">Target Time</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-[#4A5D70] hover:bg-[#FFC107]/5">
                    <td className="px-6 py-4">Lead Qualification</td>
                    <td className="px-6 py-4 text-red-300 font-medium">45 min/lead</td>
                    <td className="px-6 py-4 text-[#FFC107] font-bold">5 min/lead</td>
                  </tr>
                  <tr className="border-b border-[#4A5D70] hover:bg-[#FFC107]/5">
                    <td className="px-6 py-4">Follow-up Sequences</td>
                    <td className="px-6 py-4 text-red-300 font-medium">30 min/sequence</td>
                    <td className="px-6 py-4 text-[#FFC107] font-bold">2 min/sequence</td>
                  </tr>
                  <tr className="border-b border-[#4A5D70] hover:bg-[#FFC107]/5">
                    <td className="px-6 py-4">Data Entry</td>
                    <td className="px-6 py-4 text-red-300 font-medium">20 min/entry</td>
                    <td className="px-6 py-4 text-[#FFC107] font-bold">1 min/entry</td>
                  </tr>
                  <tr className="hover:bg-[#FFC107]/5">
                    <td className="px-6 py-4">Report Generation</td>
                    <td className="px-6 py-4 text-red-300 font-medium">2 hours/report</td>
                    <td className="px-6 py-4 text-[#FFC107] font-bold">5 min/report</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[#1C2526]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">Implementation Timeline</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { week: "Week 1-2", title: "Inbox Setup", icon: Users },
              { week: "Week 3-4", title: "Call Automation", icon: Clock },
              { week: "Week 5-6", title: "Buyer Flow", icon: TrendingUp },
              { week: "Week 7-8", title: "Post-Sale", icon: CheckCircle }
            ].map((item, index) => (
              <Card key={index} className="bg-[#2A3B3C] border-[#4A5D70] text-center hover:border-[#FFC107] transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <item.icon className="w-12 h-12 text-[#FFC107] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#FFC107] mb-2">{item.week}</h3>
                  <p className="text-gray-300">{item.title}</p>
                  <div className="flex justify-center mt-4 space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${i <= index ? 'bg-[#FFC107]' : 'bg-[#4A5D70]'}`}
                      ></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-[#2A3B3C]/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">Technology Stack</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Instantly", status: "Live" },
              { name: "GoHighLevel", status: "Enabled" },
              { name: "Gemini AI", status: "AI-Ready" },
              { name: "Slack", status: "Live" },
              { name: "Typeform", status: "Enabled" },
              { name: "Calendly", status: "Live" },
              { name: "Zapier", status: "AI-Ready" },
              { name: "Custom APIs", status: "Live" }
            ].map((tech, index) => (
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

      {/* Investment & CTA */}
      <section id="investment" className="py-20 bg-gradient-to-r from-[#1C2526] via-[#2A3B3C] to-[#1C2526]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8 text-[#FFC107]">Ready to Transform Your M&A Operations?</h2>
          
          <div className="bg-[#2A3B3C] rounded-lg p-8 border border-[#FFC107]/30 mb-8 shadow-lg shadow-[#FFC107]/10">
            <div className="flex items-center justify-center mb-6">
              <DollarSign className="w-8 h-8 text-[#FFC107] mr-2" />
              <span className="text-6xl font-bold text-[#FFC107]">$3,000</span>
            </div>
            <p className="text-xl text-gray-300 mb-6">Complete Implementation Package</p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                  All 8 implementation phases
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                  Custom automation logic
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                  Tool integration & setup
                </li>
              </ul>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                  Team training & documentation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                  30-day optimization support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFC107] mr-3" />
                  Performance monitoring setup
                </li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold px-12 py-6 text-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              Ready to Start? Let's Confirm Your Kickoff
            </Button>
            <p className="text-gray-400">
              Schedule your implementation kickoff call
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black text-center border-t border-[#4A5D70]">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-gray-500 mb-4">
            M&A Automation Strategy & Implementation Proposal
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>Powered by</span>
            <Badge className="bg-[#FFC107] text-black font-semibold">Web Launch</Badge>
            <span>• Built for Exclusive Business Brokers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
