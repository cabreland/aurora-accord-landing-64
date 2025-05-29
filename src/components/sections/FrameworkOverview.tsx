
import React from 'react';
import { Zap, Target, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FrameworkOverview = () => {
  return (
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
  );
};

export default FrameworkOverview;
