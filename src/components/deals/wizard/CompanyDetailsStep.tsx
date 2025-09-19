import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Building2, Calendar, Users, FileText } from 'lucide-react';
import { DealFormData } from './DealWizard';

interface CompanyDetailsStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

export const CompanyDetailsStep: React.FC<CompanyDetailsStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Company Details</h3>
        <p className="text-sm text-muted-foreground">
          Provide detailed information about the company's background and current situation.
        </p>
      </div>

      <div className="space-y-6">
        {/* Company Overview */}
        <div className="space-y-2">
          <Label htmlFor="company_overview" className="text-sm font-medium">
            Company Overview
          </Label>
          <Textarea
            id="company_overview"
            placeholder="Provide a comprehensive overview of the company, its business model, target market, and key value propositions..."
            value={data.company_overview}
            onChange={(e) => onChange({ company_overview: e.target.value })}
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Detailed description that investors will see in the company profile
          </p>
        </div>

        {/* Founded Year & Team Size Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="founded_year" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Founded Year
            </Label>
            <Input
              id="founded_year"
              type="number"
              placeholder="e.g. 2015"
              value={data.founded_year || ''}
              onChange={(e) => onChange({ founded_year: e.target.value ? parseInt(e.target.value) : null })}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_size" className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Size
            </Label>
            <Input
              id="team_size"
              placeholder="e.g. 25 employees, 5-10 people"
              value={data.team_size}
              onChange={(e) => onChange({ team_size: e.target.value })}
            />
          </div>
        </div>

        {/* Reason for Sale */}
        <div className="space-y-2">
          <Label htmlFor="reason_for_sale" className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reason for Sale
          </Label>
          <Textarea
            id="reason_for_sale"
            placeholder="Explain why the owner is selling the business (retirement, new opportunities, health, etc.)"
            value={data.reason_for_sale}
            onChange={(e) => onChange({ reason_for_sale: e.target.value })}
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Be transparent about the motivation behind the sale
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Company Profile Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Founded:</span> {data.founded_year || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Team Size:</span> {data.team_size || 'Not specified'}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Overview:</span> {
                data.company_overview 
                  ? `${data.company_overview.slice(0, 100)}${data.company_overview.length > 100 ? '...' : ''}` 
                  : 'Not provided'
              }
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
          💡 Pro Tip
        </div>
        <p className="text-blue-700 text-sm">
          A detailed company overview helps investors quickly understand the business and increases engagement. 
          Focus on what makes this company unique and attractive to potential buyers.
        </p>
      </div>
    </div>
  );
};