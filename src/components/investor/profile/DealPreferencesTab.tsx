import React, { useState } from 'react';
import { Edit, Save, X, Target, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InvestorProfileData } from '@/hooks/useInvestorProfileData';

interface DealPreferencesTabProps {
  profileData: InvestorProfileData;
  onUpdate: (updates: Partial<InvestorProfileData>) => Promise<boolean>;
  saving: boolean;
}

const primaryGoalOptions = [
  { value: 'operate', label: 'Acquire and actively operate the business' },
  { value: 'invest', label: 'Invest passively with existing management' },
  { value: 'grow', label: 'Grow and scale for future exit' },
  { value: 'add-on', label: 'Add-on acquisition for existing portfolio' },
  { value: 'strategic', label: 'Strategic acquisition for synergies' },
];

const communicationOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'video', label: 'Video Call' },
  { value: 'text', label: 'Text/SMS' },
];

export const DealPreferencesTab: React.FC<DealPreferencesTabProps> = ({
  profileData,
  onUpdate,
  saving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    primaryGoal: profileData.primaryGoal,
    mustHaves: profileData.mustHaves,
    dealBreakersText: profileData.dealBreakersText,
    communicationPreference: profileData.communicationPreference,
  });

  const handleSave = async () => {
    const success = await onUpdate(editData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      primaryGoal: profileData.primaryGoal,
      mustHaves: profileData.mustHaves,
      dealBreakersText: profileData.dealBreakersText,
      communicationPreference: profileData.communicationPreference,
    });
    setIsEditing(false);
  };

  const goalLabel = primaryGoalOptions.find(g => g.value === profileData.primaryGoal)?.label 
    || profileData.primaryGoal;
  
  const commLabel = communicationOptions.find(c => c.value === profileData.communicationPreference)?.label 
    || profileData.communicationPreference;

  return (
    <div className="space-y-6">
      {/* Acquisition Goals Card */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Acquisition Goals</CardTitle>
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
          {/* Primary Goal */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Primary Goal
            </Label>
            {isEditing ? (
              <RadioGroup 
                value={editData.primaryGoal}
                onValueChange={(v) => setEditData(prev => ({ ...prev, primaryGoal: v }))}
                className="space-y-2"
              >
                {primaryGoalOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={`goal-${option.value}`} />
                    <Label 
                      htmlFor={`goal-${option.value}`}
                      className="text-sm cursor-pointer text-muted-foreground"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="bg-[hsl(var(--primary))]/5 rounded-lg p-4 border border-[hsl(var(--primary))]/20">
                <p className="text-foreground font-medium">
                  {goalLabel || 'Not specified'}
                </p>
              </div>
            )}
          </div>

          {/* Must-Haves */}
          <div>
            <Label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Must-Haves
            </Label>
            {profileData.mustHaves && profileData.mustHaves.length > 0 ? (
              <div className="space-y-1">
                {profileData.mustHaves.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific must-haves specified</p>
            )}
          </div>

          {/* Walk-Away Concerns */}
          <div>
            <Label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Walk-Away Concerns
            </Label>
            {isEditing ? (
              <div>
                <Textarea
                  value={editData.dealBreakersText}
                  onChange={(e) => setEditData(prev => ({ ...prev, dealBreakersText: e.target.value }))}
                  placeholder="Describe specific red flags or concerns that would cause you to reject a deal..."
                  className="min-h-[120px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {editData.dealBreakersText.length} / 500
                </p>
              </div>
            ) : (
              <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/20">
                <p className="text-foreground text-sm italic">
                  "{profileData.dealBreakersText || 'No walk-away concerns specified'}"
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Communication Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Preferred Contact Method
            </Label>
            {isEditing ? (
              <RadioGroup 
                value={editData.communicationPreference}
                onValueChange={(v) => setEditData(prev => ({ ...prev, communicationPreference: v }))}
                className="flex flex-wrap gap-4"
              >
                {communicationOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`comm-${option.value}`} />
                    <Label 
                      htmlFor={`comm-${option.value}`}
                      className="text-sm cursor-pointer text-muted-foreground"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Badge variant="secondary" className="text-base py-1 px-3">
                {commLabel || 'Not specified'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
