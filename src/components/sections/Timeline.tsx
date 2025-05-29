
import React from 'react';
import { Users, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Timeline = () => {
  const timelineItems = [
    { week: "Week 1-2", title: "Inbox Setup", icon: Users },
    { week: "Week 3-4", title: "Call Automation", icon: Clock },
    { week: "Week 5-6", title: "Buyer Flow", icon: TrendingUp },
    { week: "Week 7-8", title: "Post-Sale", icon: CheckCircle }
  ];

  return (
    <section className="py-20 bg-[#1C2526]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">Implementation Timeline</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {timelineItems.map((item, index) => (
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
  );
};

export default Timeline;
