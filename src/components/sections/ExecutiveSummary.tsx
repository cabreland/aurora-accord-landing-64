
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ExecutiveSummary = () => {
  return (
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
  );
};

export default ExecutiveSummary;
