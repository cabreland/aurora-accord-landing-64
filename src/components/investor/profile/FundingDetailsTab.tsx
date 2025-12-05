import React, { useState } from 'react';
import { Edit, Save, X, DollarSign, Clock, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { InvestorProfileData } from '@/hooks/useInvestorProfileData';

interface FundingDetailsTabProps {
  profileData: InvestorProfileData;
  onUpdate: (updates: Partial<InvestorProfileData>) => Promise<boolean>;
  saving: boolean;
}

const fundingTypeOptions = [
  'All Cash',
  'SBA Loan',
  'Conventional Bank Loan',
  'Seller Financing',
  'Combination of Sources',
  'Investor/Partner Capital',
  'Other',
];

const proofOfFundsOptions = [
  { value: 'ready', label: 'Yes - Ready to provide documentation' },
  { value: 'two-weeks', label: 'Yes - Can obtain within 2 weeks' },
  { value: 'arrange', label: 'No - Will need to arrange financing' },
  { value: 'evaluating', label: 'Not Yet - Still evaluating options' },
];

const timelineOptions = [
  { value: 'immediate', label: 'Immediate (Ready now)' },
  { value: 'near-term', label: 'Near-term (3-6 months)' },
  { value: 'mid-term', label: 'Mid-term (6-12 months)' },
  { value: 'flexible', label: 'Flexible / Exploring' },
];

const referralSources = [
  'Google Search',
  'LinkedIn',
  'Referral from Friend/Colleague',
  'Industry Conference/Event',
  'Business Broker',
  'Other',
];

export const FundingDetailsTab: React.FC<FundingDetailsTabProps> = ({
  profileData,
  onUpdate,
  saving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fundingType: profileData.fundingType,
    fundingSources: profileData.fundingSources,
    proofOfFunds: profileData.proofOfFunds,
    timelineToClose: profileData.timelineToClose,
    referralSource: profileData.referralSource,
    referralDetails: profileData.referralDetails,
  });

  const handleSave = async () => {
    const success = await onUpdate(editData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      fundingType: profileData.fundingType,
      fundingSources: profileData.fundingSources,
      proofOfFunds: profileData.proofOfFunds,
      timelineToClose: profileData.timelineToClose,
      referralSource: profileData.referralSource,
      referralDetails: profileData.referralDetails,
    });
    setIsEditing(false);
  };

  const proofLabel = proofOfFundsOptions.find(p => p.value === profileData.proofOfFunds)?.label 
    || profileData.proofOfFunds;
  
  const timelineLabel = timelineOptions.find(t => t.value === profileData.timelineToClose)?.label 
    || profileData.timelineToClose;

  // Calculate readiness score
  const calculateReadiness = () => {
    let score = 0;
    if (profileData.proofOfFunds === 'ready') score += 40;
    else if (profileData.proofOfFunds === 'two-weeks') score += 30;
    else if (profileData.proofOfFunds === 'arrange') score += 10;
    
    if (profileData.timelineToClose === 'immediate') score += 30;
    else if (profileData.timelineToClose === 'near-term') score += 25;
    else if (profileData.timelineToClose === 'mid-term') score += 15;
    else if (profileData.timelineToClose === 'flexible') score += 10;
    
    if (profileData.fundingType) score += 20;
    if (profileData.fundingSources && profileData.fundingType === 'Combination of Sources') score += 10;
    
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadiness();

  return (
    <div className="space-y-6">
      {/* Funding Structure Card */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Funding Structure</CardTitle>
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
          {/* Primary Funding Type */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Primary Funding Type
            </Label>
            {isEditing ? (
              <Select 
                value={editData.fundingType} 
                onValueChange={(v) => setEditData(prev => ({ ...prev, fundingType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funding type" />
                </SelectTrigger>
                <SelectContent>
                  {fundingTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary" className="text-base py-1 px-3">
                {profileData.fundingType || 'Not specified'}
              </Badge>
            )}
          </div>

          {/* Funding Sources (conditional) */}
          {(profileData.fundingType === 'Combination of Sources' || editData.fundingType === 'Combination of Sources') && (
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Funding Sources Breakdown
              </Label>
              {isEditing ? (
                <div>
                  <Textarea
                    value={editData.fundingSources}
                    onChange={(e) => setEditData(prev => ({ ...prev, fundingSources: e.target.value }))}
                    placeholder="Example: 50% cash, 30% SBA loan, 20% seller note"
                    className="min-h-[80px]"
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {editData.fundingSources.length} / 300
                  </p>
                </div>
              ) : (
                <p className="text-foreground">
                  {profileData.fundingSources || 'Not specified'}
                </p>
              )}
            </div>
          )}

          {/* Proof of Funds */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Proof of Funds Status
            </Label>
            {isEditing ? (
              <RadioGroup 
                value={editData.proofOfFunds}
                onValueChange={(v) => setEditData(prev => ({ ...prev, proofOfFunds: v }))}
                className="space-y-2"
              >
                {proofOfFundsOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={`pof-${option.value}`} />
                    <Label 
                      htmlFor={`pof-${option.value}`}
                      className="text-sm cursor-pointer text-muted-foreground"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Badge 
                variant="outline" 
                className={
                  profileData.proofOfFunds === 'ready' 
                    ? 'border-green-500 text-green-500' 
                    : profileData.proofOfFunds === 'two-weeks'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-yellow-500 text-yellow-500'
                }
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {proofLabel || 'Not specified'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Readiness Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Timeline & Readiness</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline to Close */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Timeline to Close
            </Label>
            {isEditing ? (
              <RadioGroup 
                value={editData.timelineToClose}
                onValueChange={(v) => setEditData(prev => ({ ...prev, timelineToClose: v }))}
                className="space-y-2"
              >
                {timelineOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={`timeline-${option.value}`} />
                    <Label 
                      htmlFor={`timeline-${option.value}`}
                      className="text-sm cursor-pointer text-muted-foreground"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Badge variant="secondary" className="text-base py-1 px-3">
                {timelineLabel || 'Not specified'}
              </Badge>
            )}
          </div>

          {/* Readiness Assessment */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Transaction Readiness Score
            </Label>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Readiness Level</span>
                <span className="text-lg font-bold text-foreground">{readinessScore}%</span>
              </div>
              <Progress value={readinessScore} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Based on proof of funds, timeline, and funding structure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Information Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Referral Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              How did you find us?
            </Label>
            {isEditing ? (
              <Select 
                value={editData.referralSource} 
                onValueChange={(v) => setEditData(prev => ({ ...prev, referralSource: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select referral source" />
                </SelectTrigger>
                <SelectContent>
                  {referralSources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground">
                {profileData.referralSource || 'Not specified'}
              </p>
            )}
          </div>

          {profileData.referralDetails && (
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Additional Details
              </Label>
              <p className="text-muted-foreground text-sm">
                {profileData.referralDetails}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
