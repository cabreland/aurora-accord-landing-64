
import React from 'react';
import { TrendingUp, Clock, Zap } from 'lucide-react';

const SuccessMetrics = () => {
  const metrics = [
    { task: "Response Analysis", current: "2–3 hours daily", target: "<10 sec, 100% automated", savings: "99.8%" },
    { task: "Qualification Reviews", current: "1–2 hours weekly", target: "90% auto-filtered", savings: "90%" },
    { task: "Post-Call Admin", current: "30 min/call", target: "<5 sec, 100% automated", savings: "99.7%" },
    { task: "Jack/Jarrod Reviews", current: "2–3 hours weekly", target: "50% faster approvals", savings: "50%" },
    { task: "Slack Channel Setup", current: "15 min/deal", target: "<5 sec, 100% automated", savings: "99.4%" },
    { task: "Email Thread Management", current: "10 min/intro", target: "100% automated", savings: "100%" },
    { task: "Buyer Outreach & NDAs", current: "1 hour/batch", target: "<10 sec, 100% automated", savings: "99.7%" },
    { task: "LOI Coordination", current: "1 hour/deal", target: "75% faster tracking", savings: "75%" }
  ];

  return (
    <section id="metrics" className="py-24 bg-gradient-to-b from-[#1A1F2E] to-[#0A0F0F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M0 0h80v80H0z'/%3E%3Cpath d='M20 20h40v40H20z' stroke='%23D4AF37' stroke-width='1' fill='none'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#22C55E] bg-clip-text text-transparent">
            Success Metrics
          </h2>
          <p className="text-xl text-[#F4E4BC] max-w-3xl mx-auto mb-8">
            Quantified impact across all M&A automation workflows
          </p>
          
          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#2A2F3A]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/30">
              <TrendingUp className="w-8 h-8 text-[#22C55E] mx-auto mb-3" />
              <div className="text-3xl font-bold text-[#22C55E] mb-1">15-20</div>
              <div className="text-[#F4E4BC]">Hours Saved Weekly</div>
            </div>
            <div className="bg-[#2A2F3A]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/30">
              <Clock className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
              <div className="text-3xl font-bold text-[#D4AF37] mb-1">85%</div>
              <div className="text-[#F4E4BC]">Average Time Reduction</div>
            </div>
            <div className="bg-[#2A2F3A]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/30">
              <Zap className="w-8 h-8 text-[#F4E4BC] mx-auto mb-3" />
              <div className="text-3xl font-bold text-[#F4E4BC] mb-1">100%</div>
              <div className="text-[#F4E4BC]">Process Consistency</div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2F3A]/60 rounded-3xl overflow-hidden border-2 border-[#D4AF37]/30 backdrop-blur-sm shadow-2xl shadow-[#D4AF37]/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#D4AF37]/20 via-[#F4E4BC]/10 to-[#D4AF37]/20">
                <tr>
                  <th className="px-8 py-6 text-left text-[#D4AF37] font-bold text-lg">Manual Task</th>
                  <th className="px-8 py-6 text-left text-[#EF4444] font-bold text-lg">Current Time</th>
                  <th className="px-8 py-6 text-left text-[#22C55E] font-bold text-lg">Target Time</th>
                  <th className="px-8 py-6 text-left text-[#F4E4BC] font-bold text-lg">Time Savings</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => (
                  <tr key={index} className="border-b border-[#2A2F3A] hover:bg-[#D4AF37]/5 transition-all duration-300 group">
                    <td className="px-8 py-6 text-[#FAFAFA] font-medium">{metric.task}</td>
                    <td className="px-8 py-6">
                      <span className="text-[#EF4444] font-bold bg-[#EF4444]/10 px-3 py-1 rounded-lg">
                        {metric.current}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[#22C55E] font-bold bg-[#22C55E]/10 px-3 py-1 rounded-lg">
                        {metric.target}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[#D4AF37] font-bold bg-[#D4AF37]/10 px-3 py-1 rounded-lg flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {metric.savings}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Bottom Summary */}
          <div className="bg-[#D4AF37]/10 p-8 border-t border-[#D4AF37]/30">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#D4AF37] mb-4">Total Impact Summary</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#22C55E] mb-2">40-60</div>
                  <div className="text-[#F4E4BC]">Hours of Development</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#D4AF37] mb-2">8</div>
                  <div className="text-[#F4E4BC]">Automated Workflows</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FAFAFA] mb-2">∞</div>
                  <div className="text-[#F4E4BC]">Scalability Potential</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessMetrics;
