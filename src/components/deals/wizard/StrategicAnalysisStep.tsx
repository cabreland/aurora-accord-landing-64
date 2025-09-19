import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { DealFormData } from './DealWizard';

interface StrategicAnalysisStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

export const StrategicAnalysisStep: React.FC<StrategicAnalysisStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Strategic Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Help investors understand the strategic value and positioning of this acquisition opportunity.
        </p>
      </div>

      <div className="space-y-6">
        {/* Ideal Buyer Profile */}
        <div className="space-y-2">
          <Label htmlFor="ideal_buyer_profile" className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Ideal Buyer Profile
          </Label>
          <Textarea
            id="ideal_buyer_profile"
            placeholder="Describe the type of buyer who would be most interested in this acquisition (strategic acquirer, financial buyer, competitor, etc.)"
            value={data.ideal_buyer_profile}
            onChange={(e) => onChange({ ideal_buyer_profile: e.target.value })}
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Help investors understand if this deal fits their acquisition criteria
          </p>
        </div>

        {/* Rollup Potential */}
        <div className="space-y-2">
          <Label htmlFor="rollup_potential" className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Rollup/Platform Potential
          </Label>
          <Textarea
            id="rollup_potential"
            placeholder="Explain how this business could serve as a platform for further acquisitions or be part of a larger rollup strategy"
            value={data.rollup_potential}
            onChange={(e) => onChange({ rollup_potential: e.target.value })}
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Describe opportunities for building a larger business through additional acquisitions
          </p>
        </div>

        {/* Market Trends Alignment */}
        <div className="space-y-2">
          <Label htmlFor="market_trends_alignment" className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market Trends & Tailwinds
          </Label>
          <Textarea
            id="market_trends_alignment"
            placeholder="Describe how this business aligns with current market trends, industry growth, or macro tailwinds"
            value={data.market_trends_alignment}
            onChange={(e) => onChange({ market_trends_alignment: e.target.value })}
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Highlight favorable market conditions and industry trends supporting growth
          </p>
        </div>
      </div>

      {/* Strategic Value Summary */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1 space-y-3">
            <h4 className="text-sm font-medium text-foreground">Strategic Value Proposition</h4>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium text-muted-foreground">Target Buyers:</span>
                <p className="text-muted-foreground mt-1">
                  {data.ideal_buyer_profile || 'Not specified - consider describing the ideal acquirer profile'}
                </p>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Platform Potential:</span>
                <p className="text-muted-foreground mt-1">
                  {data.rollup_potential || 'Not specified - consider describing rollup opportunities'}
                </p>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Market Position:</span>
                <p className="text-muted-foreground mt-1">
                  {data.market_trends_alignment || 'Not specified - consider highlighting market tailwinds'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-1">
          🎯 Strategic Insights
        </div>
        <p className="text-green-700 text-sm">
          Strategic analysis helps investors quickly assess fit and value creation potential. 
          Focus on unique positioning, acquisition synergies, and how market trends support the investment thesis.
        </p>
      </div>
    </div>
  );
};