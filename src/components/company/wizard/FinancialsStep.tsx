
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompanyFormData } from '../CompanyWizard';

interface FinancialsStepProps {
  data: CompanyFormData;
  onChange: (data: Partial<CompanyFormData>) => void;
  isValid: boolean;
}

const FinancialsStep: React.FC<FinancialsStepProps> = ({ data, onChange, isValid }) => {
  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  const handleCurrencyChange = (field: keyof CompanyFormData, value: string) => {
    const formatted = formatCurrency(value);
    onChange({ [field]: formatted });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Financial Information</h3>
        <p className="text-muted-foreground">
          Enter financial metrics and valuation details (all fields optional)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="revenue" className="text-foreground">Annual Revenue</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="revenue"
              value={data.revenue}
              onChange={(e) => handleCurrencyChange('revenue', e.target.value)}
              placeholder="0"
              className="bg-background border-border pl-6"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="ebitda" className="text-foreground">EBITDA</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="ebitda"
              value={data.ebitda}
              onChange={(e) => handleCurrencyChange('ebitda', e.target.value)}
              placeholder="0"
              className="bg-background border-border pl-6"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="asking_price" className="text-foreground">Asking Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="asking_price"
              value={data.asking_price}
              onChange={(e) => handleCurrencyChange('asking_price', e.target.value)}
              placeholder="0"
              className="bg-background border-border pl-6"
            />
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">Financial Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Revenue: Total annual revenue (TTM preferred)</li>
            <li>• EBITDA: Earnings before interest, taxes, depreciation, and amortization</li>
            <li>• Asking Price: Current valuation or asking price from seller</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FinancialsStep;
