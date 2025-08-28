import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DealFormData } from './DealWizard';

interface FinancialsStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

export const FinancialsStep: React.FC<FinancialsStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Financial Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the key financial metrics and performance indicators for this opportunity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="revenue">Annual Revenue</Label>
          <Input
            id="revenue"
            value={data.revenue}
            onChange={(e) => onChange({ revenue: e.target.value })}
            placeholder="e.g., $5.2M"
          />
          <p className="text-xs text-muted-foreground">
            Most recent 12-month revenue figure
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ebitda">EBITDA</Label>
          <Input
            id="ebitda"
            value={data.ebitda}
            onChange={(e) => onChange({ ebitda: e.target.value })}
            placeholder="e.g., $1.2M"
          />
          <p className="text-xs text-muted-foreground">
            Earnings before interest, taxes, depreciation, and amortization
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="asking_price">Asking Price</Label>
          <Input
            id="asking_price"
            value={data.asking_price}
            onChange={(e) => onChange({ asking_price: e.target.value })}
            placeholder="e.g., $8.5M"
          />
          <p className="text-xs text-muted-foreground">
            Expected transaction value
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profit_margin">Profit Margin</Label>
          <Input
            id="profit_margin"
            value={data.profit_margin}
            onChange={(e) => onChange({ profit_margin: e.target.value })}
            placeholder="e.g., 23%"
          />
          <p className="text-xs text-muted-foreground">
            Net profit margin percentage
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="growth_rate">Revenue Growth Rate</Label>
          <Input
            id="growth_rate"
            value={data.growth_rate}
            onChange={(e) => onChange({ growth_rate: e.target.value })}
            placeholder="e.g., 35% YoY"
          />
          <p className="text-xs text-muted-foreground">
            Year-over-year revenue growth
          </p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Financial Highlights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Revenue Multiple:</span>
            <span className="ml-2 font-medium">
              {data.asking_price && data.revenue ? 
                `${(parseFloat(data.asking_price.replace(/[$M,]/g, '')) / parseFloat(data.revenue.replace(/[$M,]/g, ''))).toFixed(1)}x` : 
                'N/A'
              }
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">EBITDA Multiple:</span>
            <span className="ml-2 font-medium">
              {data.asking_price && data.ebitda ? 
                `${(parseFloat(data.asking_price.replace(/[$M,]/g, '')) / parseFloat(data.ebitda.replace(/[$M,]/g, ''))).toFixed(1)}x` : 
                'N/A'
              }
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Margin:</span>
            <span className="ml-2 font-medium">
              {data.profit_margin || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {!(data.revenue || data.ebitda) && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="text-sm text-warning-foreground">
            <strong>Recommendation:</strong> Adding at least revenue or EBITDA information will help investors evaluate this opportunity.
          </p>
        </div>
      )}
    </div>
  );
};