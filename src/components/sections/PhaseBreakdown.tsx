
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Mail, Filter, Phone, CheckCircle, Users, Handshake, FileText, DollarSign, Zap, Target, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const phases = [
    {
      id: 1,
      icon: Mail,
      title: "Cold Email Response Management",
      subtitle: "140K+ Monthly Volume",
      objective: "Automate analysis of 100+ daily responses to eliminate manual triage",
      quickWins: [
        "AI-driven response classification (info vs. meeting requests)",
        "Auto-send Calendly links for meeting requests",
        "Q&A automation using your objection-handling doc",
        "GHL pipeline entry with tagging for seamless tracking"
      ],
      whyMatters: "Eliminates 2–3 hours of daily triage, processing 100+ responses in <10 seconds with a <5% error rate, freeing your team to focus on high-value tasks like deal negotiations.",
      smartLayers: [
        "NLP for dynamic Q&A responses",
        "Prioritization via company signals (e.g., revenue, intent)",
        "Apollo enrichment for lead data enhancement"
      ],
      timelineData: { before: "2–3 hours", after: "<10 sec" }
    },
    {
      id: 2,
      icon: Filter,
      title: "Qualification & Call Management",
      subtitle: "Smart Lead Filtering",
      objective: "Automate booking reviews and lead qualification to focus on high-potential deals",
      quickWins: [
        "Auto-qualify leads (profitable, >$1M revenue, exit-ready)",
        "Auto-cancel unqualified leads with polite emails",
        "Smart routing to the right team members",
        "Pre-call briefings with lead insights"
      ],
      whyMatters: "Filters 90% of unqualified leads, saving 1–2 hours weekly and ensuring only high-potential prospects reach discovery, accelerating your deal pipeline.",
      smartLayers: [
        "Dynamic scoring for qualifications (e.g., weighted criteria)",
        "Apollo-driven research for deeper lead insights",
        "Customized rejection emails based on lead type"
      ],
      timelineData: { before: "1–2 hours", after: "Instant" }
    },
    {
      id: 3,
      icon: Phone,
      title: "Discovery Call & Post-Call Workflow",
      subtitle: "Automated Admin Tasks",
      objective: "Automate NDA, Typeform, and email threads post-call to maintain deal momentum",
      quickWins: [
        "Gemini transcript analysis for qualification insights",
        "Auto-send NDA via DocuSign post-call",
        "Auto-send Typeform for financial data collection",
        "Email thread creation (\"XYZ Company Sale Discussion\")"
      ],
      whyMatters: "Executes your 3-step post-call process in <5 seconds, reducing admin time from 30 minutes per call to zero, keeping deals moving forward without delays.",
      smartLayers: [
        "Call note verification with AI validation",
        "Pre-filled Typeforms based on call data",
        "Jack/Jarrod notifications for key updates"
      ],
      timelineData: { before: "30 min/call", after: "<5 sec" }
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "Jack/Jarrod Review & Approval Workflow",
      subtitle: "Streamlined Decision Making",
      objective: "Streamline submission reviews and approvals to reduce bottlenecks",
      quickWins: [
        "Auto-notify Jack/Jarrod on Typeform completion",
        "Review dashboard with key metrics and status",
        "Approval/rejection workflows with DocuSign integration"
      ],
      whyMatters: "Cuts approval time by 50%, automating submissions and notifications, so deals progress faster without waiting on manual reviews.",
      smartLayers: [
        "Financial verification with automated checks",
        "Risk scoring for deal prioritization",
        "Dataroom Typeform trigger for due diligence prep"
      ],
      timelineData: { before: "2–3 hours", after: "50% faster" }
    },
    {
      id: 5,
      icon: Users,
      title: "Onboarding & Slack Management",
      subtitle: "Team Collaboration Setup",
      objective: "Automate onboarding and Slack setup for seamless team collaboration",
      quickWins: [
        "Auto-approval emails with Calendly links for onboarding",
        "Dual Slack channels (client + internal) per deal",
        "Auto-add team members to channels",
        "Welcome templates for consistent communication"
      ],
      whyMatters: "Saves 15 minutes per deal on setup, ensuring your team stays aligned with zero manual effort, enhancing collaboration across deals.",
      smartLayers: [
        "Onboarding checklists with automated reminders",
        "Weekly update templates for client communication",
        "Document sharing workflows in Slack"
      ],
      timelineData: { before: "15 min/deal", after: "<5 sec" }
    },
    {
      id: 6,
      icon: Handshake,
      title: "Buyer Engagement & Introductions",
      subtitle: "Accelerated Deal Flow",
      objective: "Automate buyer outreach and intro calls to accelerate deal progression",
      quickWins: [
        "Auto-buyer blasts with deal synopsis emails",
        "NDA distribution via DocuSign",
        "Financial sharing post-NDA with secure links",
        "Email threads (\"[Buyer Name] <> [Company Name]\")",
        "Intro call scheduling with Calendly"
      ],
      whyMatters: "Reduces buyer outreach time from 1 hour per batch to <10 seconds, ensuring faster, more efficient introductions with zero communication gaps.",
      smartLayers: [
        "Proof-of-funds verification with bank API checks",
        "Interest scoring based on buyer responses",
        "Buyer-seller fit analysis using AI"
      ],
      timelineData: { before: "1 hour/batch", after: "<10 sec" }
    },
    {
      id: 7,
      icon: FileText,
      title: "LOI & Due Diligence",
      subtitle: "Deal Closure Coordination",
      objective: "Automate LOI and due diligence workflows for smoother deal closure",
      quickWins: [
        "LOI generation and distribution via DocuSign",
        "Attorney coordination with automated emails",
        "Payment tracking with milestone notifications",
        "Slack channel creation (\"[Buyer Name]\")",
        "Milestone tracking for due diligence steps"
      ],
      whyMatters: "Speeds up LOI coordination by 75%, automating milestone tracking and reducing manual follow-ups, ensuring deals close on time.",
      smartLayers: [
        "Due diligence checklists with automated updates",
        "Milestone dashboards for real-time tracking",
        "Delay escalation notifications for stalled steps"
      ],
      timelineData: { before: "1 hour/deal", after: "75% faster" }
    },
    {
      id: 8,
      icon: DollarSign,
      title: "Post-Sale & Upsell Automation",
      subtitle: "Revenue Maximization",
      objective: "Automate deal closure and upsell sequences to maximize revenue",
      quickWins: [
        "Closing confirmation emails to all parties",
        "CRM cleanup with automated tagging",
        "Auto-upsell sequences (e.g., website, marketing services)",
        "Success notifications to celebrate wins"
      ],
      whyMatters: "Saves time on post-sale admin while driving upsell revenue, ensuring a seamless transition and long-term client value with zero manual effort.",
      smartLayers: [
        "Upsell ROI tracking with performance dashboards",
        "Success story collection for marketing",
        "Referral automation to generate new leads"
      ],
      timelineData: { before: "Manual effort", after: "Fully automated" }
    }
  ];

  return (
    <section id="phases" className="py-24 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] relative overflow-hidden">
      {/* Background Circuit Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M20 20h60v60H20z' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.3'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%23D4AF37' opacity='0.5'/%3E%3Ccircle cx='80' cy='20' r='2' fill='%23D4AF37' opacity='0.5'/%3E%3Ccircle cx='20' cy='80' r='2' fill='%23D4AF37' opacity='0.5'/%3E%3Ccircle cx='80' cy='80' r='2' fill='%23D4AF37' opacity='0.5'/%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent">
            Implementation Phases
          </h2>
          <p className="text-xl text-[#F4E4BC] max-w-3xl mx-auto">
            8 strategic phases designed to transform your M&A operations from manual chaos to automated excellence
          </p>
        </div>
        
        <div className="space-y-6">
          {phases.map((phase) => (
            <Card key={phase.id} className="bg-[#2A2F3A]/80 border-[#D4AF37]/30 overflow-hidden hover:border-[#D4AF37] transition-all duration-500 hover:shadow-2xl hover:shadow-[#D4AF37]/20 backdrop-blur-sm group">
              <CardHeader 
                className="cursor-pointer hover:bg-[#D4AF37]/5 transition-all duration-300 relative overflow-hidden"
                onClick={() => togglePhase(phase.id)}
              >
                {/* Animated Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-[#D4AF37]/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30 group-hover:scale-110 transition-transform duration-300">
                        <phase.icon className="w-8 h-8 text-[#0A0F0F]" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center">
                        <span className="text-[#0A0F0F] text-xs font-bold">{phase.id}</span>
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl md:text-2xl text-[#FAFAFA] mb-1">{phase.title}</CardTitle>
                      <p className="text-[#D4AF37] font-medium">{phase.subtitle}</p>
                    </div>
                    
                    {/* Timeline Preview */}
                    <div className="hidden lg:flex items-center space-x-4 ml-8">
                      <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30">
                        Before: {phase.timelineData.before}
                      </Badge>
                      <div className="w-8 h-px bg-[#D4AF37]"></div>
                      <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30">
                        After: {phase.timelineData.after}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Status Indicator */}
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-[#EF4444] rounded-full animate-pulse"></div>
                      <div className="w-1 h-3 bg-[#2A2F3A]"></div>
                      <div className="w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse delay-300"></div>
                    </div>
                    {expandedPhases.includes(phase.id) ? (
                      <ChevronDown className="w-6 h-6 text-[#D4AF37] transition-transform duration-300" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-[#D4AF37] transition-transform duration-300" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {expandedPhases.includes(phase.id) && (
                <CardContent className="border-t border-[#D4AF37]/20 animate-fade-in">
                  <div className="pt-8">
                    {/* Objective */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-[#D4AF37]/30 pb-2">
                        Objective
                      </h4>
                      <p className="text-[#FAFAFA] leading-relaxed">{phase.objective}</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 mb-8">
                      {/* Quick Wins */}
                      <div>
                        <h4 className="text-lg font-semibold text-[#22C55E] mb-4 flex items-center">
                          <Zap className="w-5 h-5 mr-2" />
                          Quick Wins
                        </h4>
                        <ul className="space-y-3">
                          {phase.quickWins.map((win, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                              <span className="text-[#F4E4BC] leading-relaxed">{win}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Why It Matters */}
                      <div>
                        <h4 className="text-lg font-semibold text-[#D4AF37] mb-4 flex items-center">
                          <Target className="w-5 h-5 mr-2" />
                          Why It Matters
                        </h4>
                        <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 p-6 rounded-xl backdrop-blur-sm">
                          <p className="text-[#FAFAFA] leading-relaxed">{phase.whyMatters}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Smart Layers */}
                    <div className="pt-6 border-t border-[#2A2F3A]">
                      <button
                        onClick={() => toggleSection(`smart-${phase.id}`)}
                        className="flex items-center text-[#F4E4BC] hover:text-[#D4AF37] transition-colors duration-300 group"
                      >
                        <Brain className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                        <span className="font-medium">Smart Layers</span>
                        {expandedSections.includes(`smart-${phase.id}`) ? (
                          <ChevronDown className="w-5 h-5 ml-2 transition-transform duration-300" />
                        ) : (
                          <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300" />
                        )}
                      </button>
                      
                      {expandedSections.includes(`smart-${phase.id}`) && (
                        <div className="mt-6 pl-7 border-l-2 border-[#D4AF37]/30 animate-fade-in">
                          <ul className="space-y-3">
                            {phase.smartLayers.map((layer, index) => (
                              <li key={index} className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-[#F4E4BC] leading-relaxed">{layer}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
