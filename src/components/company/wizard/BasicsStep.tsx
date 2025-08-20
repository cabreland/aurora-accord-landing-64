
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompanyFormData } from '../CompanyWizard';

interface BasicsStepProps {
  data: CompanyFormData;
  onChange: (data: Partial<CompanyFormData>) => void;
  isValid: boolean;
}

const industries = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Energy',
  'Transportation',
  'Education',
  'Other'
];

const BasicsStep: React.FC<BasicsStepProps> = ({ data, onChange, isValid }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Company Basics</h3>
        <p className="text-muted-foreground">
          Enter the fundamental information about the company
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-foreground">
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Enter company name"
            className="bg-background border-border"
          />
          {!data.name.trim() && (
            <p className="text-sm text-destructive mt-1">Company name is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="industry" className="text-foreground">Industry</Label>
          <Select value={data.industry} onValueChange={(value) => onChange({ industry: value })}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location" className="text-foreground">Location</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="City, State / Country"
            className="bg-background border-border"
          />
        </div>

        <div>
          <Label htmlFor="summary" className="text-foreground">Company Summary</Label>
          <Textarea
            id="summary"
            value={data.summary}
            onChange={(e) => onChange({ summary: e.target.value })}
            placeholder="Brief description of the company and its business model"
            className="bg-background border-border min-h-24"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicsStep;
