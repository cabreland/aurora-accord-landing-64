import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DealFormData } from './DealWizard';

interface BasicInfoStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Basic Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the fundamental details about this deal opportunity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Deal Title *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g., SaaS Platform Acquisition"
            className={!data.title ? 'border-destructive/50' : ''}
          />
          {!data.title && (
            <p className="text-xs text-destructive">Deal title is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={data.company_name}
            onChange={(e) => onChange({ company_name: e.target.value })}
            placeholder="e.g., Green Energy Corp"
            className={!data.company_name ? 'border-destructive/50' : ''}
          />
          {!data.company_name && (
            <p className="text-xs text-destructive">Company name is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select value={data.industry} onValueChange={(value) => onChange({ industry: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="E-commerce">E-commerce</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Clean Tech">Clean Tech</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Financial Services">Financial Services</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g., New York, NY"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deal Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Provide a comprehensive overview of the deal opportunity, including key business highlights, market position, and investment thesis..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          This description will be visible to potential investors in the deal summary.
        </p>
      </div>

      {!isValid && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive font-medium">
            Please complete the required fields to continue.
          </p>
        </div>
      )}
    </div>
  );
};