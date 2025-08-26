
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { CompanyFormData } from '../CompanyWizard';

interface CompanyDetailsStepProps {
  data: CompanyFormData;
  onChange: (data: Partial<CompanyFormData>) => void;
  isValid: boolean;
}

const CompanyDetailsStep: React.FC<CompanyDetailsStepProps> = ({ data, onChange, isValid }) => {
  const [newGrowthOpp, setNewGrowthOpp] = useState('');
  const [newDocument, setNewDocument] = useState({ name: '', type: '', size: '' });

  const addGrowthOpportunity = () => {
    if (newGrowthOpp.trim()) {
      const currentOpps = data.growth_opportunities || [];
      onChange({
        growth_opportunities: [...currentOpps, newGrowthOpp.trim()]
      });
      setNewGrowthOpp('');
    }
  };

  const removeGrowthOpportunity = (index: number) => {
    const currentOpps = data.growth_opportunities || [];
    onChange({
      growth_opportunities: currentOpps.filter((_, i) => i !== index)
    });
  };

  const addDocument = () => {
    if (newDocument.name.trim()) {
      const currentDocs = data.placeholder_documents || [];
      onChange({
        placeholder_documents: [...currentDocs, { ...newDocument, lastUpdated: 'Just added' }]
      });
      setNewDocument({ name: '', type: '', size: '' });
    }
  };

  const removeDocument = (index: number) => {
    const currentDocs = data.placeholder_documents || [];
    onChange({
      placeholder_documents: currentDocs.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Company Details</h3>
        <p className="text-muted-foreground">
          Add detailed information that will be shown to investors
        </p>
      </div>

      <div className="space-y-6">
        {/* Company Overview */}
        <div>
          <Label htmlFor="detailed_description" className="text-foreground font-medium">
            Detailed Company Description
          </Label>
          <Textarea
            id="detailed_description"
            value={data.detailed_description || ''}
            onChange={(e) => onChange({ detailed_description: e.target.value })}
            placeholder="Comprehensive description of the company, its business model, market position, and competitive advantages..."
            className="bg-background border-border min-h-32"
          />
        </div>

        {/* Company Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="founded_year" className="text-foreground">Founded Year</Label>
            <Input
              id="founded_year"
              value={data.founded_year || ''}
              onChange={(e) => onChange({ founded_year: e.target.value })}
              placeholder="2018"
              className="bg-background border-border"
            />
          </div>
          <div>
            <Label htmlFor="team_size" className="text-foreground">Team Size</Label>
            <Input
              id="team_size"
              value={data.team_size || ''}
              onChange={(e) => onChange({ team_size: e.target.value })}
              placeholder="45 Employees"
              className="bg-background border-border"
            />
          </div>
          <div>
            <Label htmlFor="reason_for_sale" className="text-foreground">Reason for Sale</Label>
            <Input
              id="reason_for_sale"
              value={data.reason_for_sale || ''}
              onChange={(e) => onChange({ reason_for_sale: e.target.value })}
              placeholder="Retirement"
              className="bg-background border-border"
            />
          </div>
        </div>

        {/* Growth Opportunities */}
        <div>
          <Label className="text-foreground font-medium">Growth Opportunities</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={newGrowthOpp}
              onChange={(e) => setNewGrowthOpp(e.target.value)}
              placeholder="Add a growth opportunity..."
              className="bg-background border-border"
              onKeyPress={(e) => e.key === 'Enter' && addGrowthOpportunity()}
            />
            <Button
              type="button"
              onClick={addGrowthOpportunity}
              disabled={!newGrowthOpp.trim()}
              size="icon"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 mt-3 max-h-32 overflow-y-auto">
            {(data.growth_opportunities || []).map((opp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border"
              >
                <span className="text-sm text-foreground">{opp}</span>
                <Button
                  type="button"
                  onClick={() => removeGrowthOpportunity(index)}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Founder's Message */}
        <div>
          <Label htmlFor="founders_message" className="text-foreground font-medium">
            Founder's Message
          </Label>
          <Textarea
            id="founders_message"
            value={data.founders_message || ''}
            onChange={(e) => onChange({ founders_message: e.target.value })}
            placeholder="Message from the founder/CEO about the business and why they're selling..."
            className="bg-background border-border min-h-24"
          />
        </div>

        <div>
          <Label htmlFor="founder_name" className="text-foreground">Founder Name & Title</Label>
          <Input
            id="founder_name"
            value={data.founder_name || ''}
            onChange={(e) => onChange({ founder_name: e.target.value })}
            placeholder="Sarah Johnson, Founder & CEO"
            className="bg-background border-border"
          />
        </div>

        {/* Strategic Fit */}
        <div className="space-y-4">
          <Label className="text-foreground font-medium">Strategic Fit Analysis</Label>
          
          <div>
            <Label htmlFor="ideal_buyer_profile" className="text-foreground text-sm">Ideal Buyer Profile</Label>
            <Textarea
              id="ideal_buyer_profile"
              value={data.ideal_buyer_profile || ''}
              onChange={(e) => onChange({ ideal_buyer_profile: e.target.value })}
              placeholder="Description of the ideal buyer for this business..."
              className="bg-background border-border"
            />
          </div>

          <div>
            <Label htmlFor="rollup_potential" className="text-foreground text-sm">Roll-up Potential</Label>
            <Textarea
              id="rollup_potential"
              value={data.rollup_potential || ''}
              onChange={(e) => onChange({ rollup_potential: e.target.value })}
              placeholder="Potential for combining with other businesses..."
              className="bg-background border-border"
            />
          </div>

          <div>
            <Label htmlFor="market_trends" className="text-foreground text-sm">Market Trends Alignment</Label>
            <Textarea
              id="market_trends"
              value={data.market_trends || ''}
              onChange={(e) => onChange({ market_trends: e.target.value })}
              placeholder="How this business aligns with current market trends..."
              className="bg-background border-border"
            />
          </div>
        </div>

        {/* Additional Financial Metrics */}
        <div className="space-y-4">
          <Label className="text-foreground font-medium">Additional Financial Metrics</Label>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profit_margin" className="text-foreground text-sm">Net Profit Margin (%)</Label>
              <Input
                id="profit_margin"
                value={data.profit_margin || ''}
                onChange={(e) => onChange({ profit_margin: e.target.value })}
                placeholder="24.7"
                className="bg-background border-border"
              />
            </div>
            <div>
              <Label htmlFor="customer_count" className="text-foreground text-sm">Customer Count</Label>
              <Input
                id="customer_count"
                value={data.customer_count || ''}
                onChange={(e) => onChange({ customer_count: e.target.value })}
                placeholder="500+"
                className="bg-background border-border"
              />
            </div>
            <div>
              <Label htmlFor="recurring_revenue" className="text-foreground text-sm">Recurring Revenue (%)</Label>
              <Input
                id="recurring_revenue"
                value={data.recurring_revenue || ''}
                onChange={(e) => onChange({ recurring_revenue: e.target.value })}
                placeholder="85"
                className="bg-background border-border"
              />
            </div>
            <div>
              <Label htmlFor="cac_ltv_ratio" className="text-foreground text-sm">CAC/LTV Ratio</Label>
              <Input
                id="cac_ltv_ratio"
                value={data.cac_ltv_ratio || ''}
                onChange={(e) => onChange({ cac_ltv_ratio: e.target.value })}
                placeholder="1:8.2"
                className="bg-background border-border"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsStep;
