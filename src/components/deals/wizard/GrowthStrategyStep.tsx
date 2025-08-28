import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { DealFormData } from './DealWizard';

interface GrowthStrategyStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

export const GrowthStrategyStep: React.FC<GrowthStrategyStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  const [newOpportunity, setNewOpportunity] = useState('');

  const addGrowthOpportunity = () => {
    if (newOpportunity.trim()) {
      onChange({
        growth_opportunities: [...data.growth_opportunities, newOpportunity.trim()]
      });
      setNewOpportunity('');
    }
  };

  const removeGrowthOpportunity = (index: number) => {
    onChange({
      growth_opportunities: data.growth_opportunities.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Growth & Strategy</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Highlight the growth potential and strategic advantages of this opportunity.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="growth_opportunities">Growth Opportunities</Label>
          <div className="flex gap-2">
            <Input
              value={newOpportunity}
              onChange={(e) => setNewOpportunity(e.target.value)}
              placeholder="e.g., International expansion, Product line extension..."
              onKeyPress={(e) => e.key === 'Enter' && addGrowthOpportunity()}
            />
            <Button 
              type="button" 
              onClick={addGrowthOpportunity}
              size="icon"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {data.growth_opportunities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.growth_opportunities.map((opportunity, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {opportunity}
                  <button
                    type="button"
                    onClick={() => removeGrowthOpportunity(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Add specific areas where the business can grow or expand.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="market_position">Market Position</Label>
          <Textarea
            id="market_position"
            value={data.market_position}
            onChange={(e) => onChange({ market_position: e.target.value })}
            placeholder="Describe the company's position in the market, competitive landscape, and market share..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="competitive_advantages">Competitive Advantages</Label>
          <Textarea
            id="competitive_advantages"
            value={data.competitive_advantages}
            onChange={(e) => onChange({ competitive_advantages: e.target.value })}
            placeholder="What makes this business unique? Patents, proprietary technology, exclusive partnerships, etc..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strategic_fit">Strategic Fit</Label>
          <Textarea
            id="strategic_fit"
            value={data.strategic_fit}
            onChange={(e) => onChange({ strategic_fit: e.target.value })}
            placeholder="Why this deal makes sense for potential acquirers or investors..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Growth Strategy Summary</h4>
        <div className="text-sm text-muted-foreground">
          {data.growth_opportunities.length > 0 ? (
            <p>
              <strong>{data.growth_opportunities.length}</strong> growth opportunities identified
            </p>
          ) : (
            <p>No growth opportunities added yet</p>
          )}
          {data.market_position && (
            <p className="mt-1">✓ Market position defined</p>
          )}
          {data.competitive_advantages && (
            <p className="mt-1">✓ Competitive advantages outlined</p>
          )}
          {data.strategic_fit && (
            <p className="mt-1">✓ Strategic fit explained</p>
          )}
        </div>
      </div>
    </div>
  );
};