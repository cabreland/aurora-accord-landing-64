
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Target, Zap, Brain, CheckCircle, Clock, DollarSign, Users, TrendingUp } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwKSI+CjxwYXRoIGQ9Ik0yMCAwTDQwIDIwTDIwIDQwTDAgMjBMMjAgMFoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcikiLz4KPC9nPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyIiB4MT0iMjAiIHkxPSIwIiB4Mj0iMjAiIHkyPSI0MCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkZEOTAwIiBzdG9wLW9wYWNpdHk9IjAuMSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRkQ5MDAiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8Y2xpcFBhdGggaWQ9ImNsaXAwIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=')] opacity-20"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="mb-6">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 mb-4">
              M&A Automation Strategy & Implementation Proposal
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-yellow-500 bg-clip-text text-transparent">
            Transforming M&A with Automation
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Built for Jack's team. Powered by AI. Designed to scale.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={scrollToPhases}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 text-lg"
            >
              Jump to Plan
            </Button>
            <Button 
              variant="outline" 
              className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 px-8 py-3 text-lg"
            >
              Executive Summary
            </Button>
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 text-yellow-300">Executive Summary</h2>
            <div className="bg-gradient-to-r from-yellow-500/20 to-transparent p-6 rounded-lg border border-yellow-500/30 mb-8">
              <p className="text-lg italic text-yellow-200">
                "Built from Jack's SOP Notes"
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">140K</div>
                <div className="text-gray-300">Emails/Month</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">1,000</div>
                <div className="text-gray-300">Inboxes</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">85%</div>
                <div className="text-gray-300">Manual Tasks</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-semibold mb-4 text-yellow-300">Current Friction Points</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Manual lead qualification across multiple platforms
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Inconsistent follow-up sequences
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Disconnected buyer and seller workflows
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Time-intensive post-sale processes
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Framework Key */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-yellow-300">Framework Overview</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700 hover:border-green-500/50 transition-colors">
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

            <Card className="bg-gray-800 border-gray-700 hover:border-yellow-500/50 transition-colors">
              <CardHeader className="text-center">
                <Target className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <CardTitle className="text-yellow-400">Why It Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">Strategic purpose and long-term impact explanations</p>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 mt-4 mx-auto block w-fit">
                  Strategic Value
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors">
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
      <section id="phases" className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-yellow-300">Implementation Phases</h2>
          
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((phase) => (
              <Card key={phase} className="bg-gray-800 border-gray-700 overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => togglePhase(phase)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                        {phase}
                      </div>
                      <CardTitle className="text-xl">Phase {phase} - [Title Placeholder]</CardTitle>
                    </div>
                    {expandedPhases.includes(phase) ? (
                      <ChevronDown className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedPhases.includes(phase) && (
                  <CardContent className="border-t border-gray-700 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-8 pt-6">
                      <div>
                        <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          Quick Wins
                        </h4>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                            [Quick Win 1 - Content Placeholder]
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                            [Quick Win 2 - Content Placeholder]
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                            [Quick Win 3 - Content Placeholder]
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Why It Matters
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          [Strategic explanation paragraph - Content Placeholder. This section will explain the strategic purpose and long-term impact of this phase.]
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <button
                        onClick={() => toggleSection(`smart-${phase}`)}
                        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
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
                        <div className="mt-4 pl-6 border-l-2 border-blue-500/30 animate-fade-in">
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
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-yellow-300">Success Metrics</h2>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-yellow-300 font-semibold">Manual Task</th>
                    <th className="px-6 py-4 text-left text-red-300 font-semibold">Current Time</th>
                    <th className="px-6 py-4 text-left text-green-300 font-semibold">Target Time</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="px-6 py-4">Lead Qualification</td>
                    <td className="px-6 py-4 text-red-300">45 min/lead</td>
                    <td className="px-6 py-4 text-green-300">5 min/lead</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="px-6 py-4">Follow-up Sequences</td>
                    <td className="px-6 py-4 text-red-300">30 min/sequence</td>
                    <td className="px-6 py-4 text-green-300">2 min/sequence</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="px-6 py-4">Data Entry</td>
                    <td className="px-6 py-4 text-red-300">20 min/entry</td>
                    <td className="px-6 py-4 text-green-300">1 min/entry</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Report Generation</td>
                    <td className="px-6 py-4 text-red-300">2 hours/report</td>
                    <td className="px-6 py-4 text-green-300">5 min/report</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-yellow-300">Implementation Timeline</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { week: "Week 1-2", title: "Inbox Setup", icon: Users },
              { week: "Week 3-4", title: "Call Automation", icon: Clock },
              { week: "Week 5-6", title: "Buyer Flow", icon: TrendingUp },
              { week: "Week 7-8", title: "Post-Sale", icon: CheckCircle }
            ].map((item, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 text-center">
                <CardContent className="p-6">
                  <item.icon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">{item.week}</h3>
                  <p className="text-gray-300">{item.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-yellow-300">Technology Stack</h2>
          
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
              <Card key={index} className="bg-gray-800 border-gray-700 text-center hover:border-yellow-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-2xl font-bold text-yellow-400">{tech.name.charAt(0)}</div>
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
      <section className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8 text-yellow-300">Ready to Transform Your M&A Operations?</h2>
          
          <div className="bg-gray-800 rounded-lg p-8 border border-yellow-500/30 mb-8">
            <div className="flex items-center justify-center mb-6">
              <DollarSign className="w-8 h-8 text-yellow-400 mr-2" />
              <span className="text-5xl font-bold text-yellow-400">$3,000</span>
            </div>
            <p className="text-xl text-gray-300 mb-6">Complete Implementation Package</p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  All 8 implementation phases
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  Custom automation logic
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  Tool integration & setup
                </li>
              </ul>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  Team training & documentation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  30-day optimization support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  Performance monitoring setup
                </li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-12 py-4 text-xl">
              Ready to Start? Let's Confirm Your Kickoff
            </Button>
            <p className="text-gray-400">
              Schedule your implementation kickoff call
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black text-center">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-gray-500 mb-4">
            M&A Automation Strategy & Implementation Proposal
          </p>
          <p className="text-gray-600">
            Powered by Web Launch • Built for Exclusive Business Brokers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
