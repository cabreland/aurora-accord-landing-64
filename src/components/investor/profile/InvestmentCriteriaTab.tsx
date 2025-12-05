import React, { useState } from 'react';
import { Edit, Save, X, Target, DollarSign, MapPin, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { InvestorProfileData } from '@/hooks/useInvestorProfileData';

interface InvestmentCriteriaTabProps {
  profileData: InvestorProfileData;
  onUpdate: (updates: Partial<InvestorProfileData>) => Promise<boolean>;
  saving: boolean;
}

const industries = [
  'SaaS', 'E-commerce', 'Digital Agency', 'Content/Media', 
  'Marketplace', 'Mobile Apps', 'Healthcare Tech', 'FinTech',
  'EdTech', 'B2B Services', 'Consumer Products', 'Other'
];

const investmentRanges = [
  '$100K - $500K',
  '$500K - $1M',
  '$1M - $2.5M',
  '$2.5M - $5M',
  '$5M - $10M',
  '$10M+',
];

const revenueRanges = [
  'Under $500K',
  '$500K - $1M',
  '$1M - $3M',
  '$3M - $5M',
  '$5M - $10M',
  '$10M+',
];

const ebitdaRanges = [
  'Under $100K',
  '$100K - $250K',
  '$250K - $500K',
  '$500K - $1M',
  '$1M - $2M',
  '$2M+',
];

const geographicOptions = [
  { value: 'north-america', label: 'North America (US & Canada)' },
  { value: 'us-only', label: 'United States Only' },
  { value: 'global', label: 'Global / Location Independent' },
  { value: 'europe', label: 'Europe' },
  { value: 'other', label: 'Other' },
];

export const InvestmentCriteriaTab: React.FC<InvestmentCriteriaTabProps> = ({
  profileData,
  onUpdate,
  saving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    targetIndustries: profileData.targetIndustries,
    minInvestment: profileData.minInvestment,
    maxInvestment: profileData.maxInvestment,
    revenueRangePreference: profileData.revenueRangePreference,
    ebitdaRangePreference: profileData.ebitdaRangePreference,
    geographicPreference: profileData.geographicPreference,
  });

  const handleSave = async () => {
    const success = await onUpdate(editData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      targetIndustries: profileData.targetIndustries,
      minInvestment: profileData.minInvestment,
      maxInvestment: profileData.maxInvestment,
      revenueRangePreference: profileData.revenueRangePreference,
      ebitdaRangePreference: profileData.ebitdaRangePreference,
      geographicPreference: profileData.geographicPreference,
    });
    setIsEditing(false);
  };

  const toggleIndustry = (industry: string) => {
    setEditData(prev => ({
      ...prev,
      targetIndustries: prev.targetIndustries.includes(industry)
        ? prev.targetIndustries.filter(i => i !== industry)
        : [...prev.targetIndustries, industry],
    }));
  };

  const geoLabel = geographicOptions.find(g => g.value === profileData.geographicPreference)?.label 
    || profileData.geographicPreference;

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Investment Target Profile</CardTitle>
          </div>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Industries */}
          <div>
            <Label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
              <Building className="w-4 h-4" />
              Target Industries
            </Label>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {industries.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={`industry-${industry}`}
                      checked={editData.targetIndustries.includes(industry)}
                      onCheckedChange={() => toggleIndustry(industry)}
                    />
                    <Label 
                      htmlFor={`industry-${industry}`}
                      className="text-sm cursor-pointer text-muted-foreground"
                    >
                      {industry}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData.targetIndustries.length > 0 ? (
                  profileData.targetIndustries.map((industry) => (
                    <Badge 
                      key={industry} 
                      variant="secondary"
                      className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20"
                    >
                      {industry}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No industries specified</span>
                )}
              </div>
            )}
          </div>

          {/* Investment Range */}
          <div>
            <Label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4" />
              Investment Range
            </Label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Minimum</Label>
                  <Select 
                    value={editData.minInvestment} 
                    onValueChange={(v) => setEditData(prev => ({ ...prev, minInvestment: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select minimum" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentRanges.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Maximum</Label>
                  <Select 
                    value={editData.maxInvestment} 
                    onValueChange={(v) => setEditData(prev => ({ ...prev, maxInvestment: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select maximum" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentRanges.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg py-1 px-3">
                  {profileData.minInvestment || 'Not set'} — {profileData.maxInvestment || 'Not set'}
                </Badge>
              </div>
            )}
          </div>

          {/* Revenue & EBITDA */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Revenue Range Preference
              </Label>
              {isEditing ? (
                <Select 
                  value={editData.revenueRangePreference} 
                  onValueChange={(v) => setEditData(prev => ({ ...prev, revenueRangePreference: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueRanges.map((range) => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground font-medium">
                  {profileData.revenueRangePreference || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                EBITDA Range Preference
              </Label>
              {isEditing ? (
                <Select 
                  value={editData.ebitdaRangePreference} 
                  onValueChange={(v) => setEditData(prev => ({ ...prev, ebitdaRangePreference: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select EBITDA range" />
                  </SelectTrigger>
                  <SelectContent>
                    {ebitdaRanges.map((range) => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground font-medium">
                  {profileData.ebitdaRangePreference || 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {/* Geographic Preference */}
          <div>
            <Label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              Geographic Preference
            </Label>
            {isEditing ? (
              <Select 
                value={editData.geographicPreference} 
                onValueChange={(v) => setEditData(prev => ({ ...prev, geographicPreference: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select geographic preference" />
                </SelectTrigger>
                <SelectContent>
                  {geographicOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground font-medium">
                {geoLabel || 'Not specified'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
