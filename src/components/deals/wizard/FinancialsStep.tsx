import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calculator, Users, Repeat } from 'lucide-react';
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Financial Metrics</h3>
        <p className="text-sm text-muted-foreground">
          Provide comprehensive financial information to help investors evaluate the opportunity.
        </p>
      </div>

      {/* Primary Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="revenue" className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Annual Revenue
          </Label>
          <Input
            id="revenue"
            placeholder="e.g. $2.5M, $500K"
            value={data.revenue}
            onChange={(e) => onChange({ revenue: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ebitda" className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            EBITDA
          </Label>
          <Input
            id="ebitda"
            placeholder="e.g. $750K, $125K"
            value={data.ebitda}
            onChange={(e) => onChange({ ebitda: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="asking_price" className="text-sm font-medium">
            Asking Price
          </Label>
          <Input
            id="asking_price"
            placeholder="e.g. $3M, $1.2M"
            value={data.asking_price}
            onChange={(e) => onChange({ asking_price: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="growth_rate" className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Revenue Growth Rate
          </Label>
          <Input
            id="growth_rate"
            placeholder="e.g. 25%, 15% YoY"
            value={data.growth_rate}
            onChange={(e) => onChange({ growth_rate: e.target.value })}
          />
        </div>
      </div>

      {/* Additional Financial Metrics */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">Business Metrics</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="profit_margin" className="text-sm font-medium">
              Profit Margin
            </Label>
            <Input
              id="profit_margin"
              placeholder="e.g. 30%, 15%"
              value={data.profit_margin}
              onChange={(e) => onChange({ profit_margin: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_count" className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customer Count
            </Label>
            <Input
              id="customer_count"
              placeholder="e.g. 1,200, 500+"
              value={data.customer_count}
              onChange={(e) => onChange({ customer_count: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurring_revenue" className="text-sm font-medium flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Recurring Revenue %
            </Label>
            <Input
              id="recurring_revenue"
              placeholder="e.g. 80%, $1.5M ARR"
              value={data.recurring_revenue}
              onChange={(e) => onChange({ recurring_revenue: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cac_ltv_ratio" className="text-sm font-medium">
              CAC/LTV Ratio
            </Label>
            <Input
              id="cac_ltv_ratio"
              placeholder="e.g. 1:5, 1:3"
              value={data.cac_ltv_ratio}
              onChange={(e) => onChange({ cac_ltv_ratio: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Financial Highlights */}
      <Card className="p-4 bg-muted/30">
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
      </Card>

      {!(data.revenue || data.ebitda) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-700">
            <strong>Recommendation:</strong> Adding at least revenue or EBITDA information will help investors evaluate this opportunity.
          </p>
        </div>
      )}
    </div>
  );
};