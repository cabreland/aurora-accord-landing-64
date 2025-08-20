
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CompanyFormData } from '../CompanyWizard';
import { useUserProfile } from '@/hooks/useUserProfile';

interface DealStepProps {
  data: CompanyFormData;
  onChange: (data: Partial<CompanyFormData>) => void;
  isValid: boolean;
}

const dealStages = [
  { value: 'teaser', label: 'Teaser' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'dd', label: 'Due Diligence' },
  { value: 'closing', label: 'Closing' }
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const DealStep: React.FC<DealStepProps> = ({ data, onChange, isValid }) => {
  const { profile } = useUserProfile();

  // Set current user as default owner if not set
  React.useEffect(() => {
    if (!data.owner_id && profile?.user_id) {
      onChange({ owner_id: profile.user_id });
    }
  }, [profile?.user_id, data.owner_id, onChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Deal Information</h3>
        <p className="text-muted-foreground">
          Configure deal-specific details and tracking information
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="stage" className="text-foreground">
            Deal Stage <span className="text-destructive">*</span>
          </Label>
          <Select value={data.stage} onValueChange={(value) => onChange({ stage: value as CompanyFormData['stage'] })}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select deal stage" />
            </SelectTrigger>
            <SelectContent>
              {dealStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!data.stage && (
            <p className="text-sm text-destructive mt-1">Deal stage is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="priority" className="text-foreground">
            Priority <span className="text-destructive">*</span>
          </Label>
          <Select value={data.priority} onValueChange={(value) => onChange({ priority: value as CompanyFormData['priority'] })}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!data.priority && (
            <p className="text-sm text-destructive mt-1">Priority is required</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Fit Score: {data.fit_score}%
          </Label>
          <div className="px-2 py-4">
            <Slider
              value={[data.fit_score]}
              onValueChange={(value) => onChange({ fit_score: value[0] })}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Poor Fit</span>
            <span>Perfect Fit</span>
          </div>
        </div>

        <div>
          <Label htmlFor="owner_id" className="text-foreground">
            Deal Owner <span className="text-destructive">*</span>
          </Label>
          <Select value={data.owner_id} onValueChange={(value) => onChange({ owner_id: value })}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select deal owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={profile?.user_id || 'current-user'}>
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}` 
                  : profile?.email || 'Current User'}
              </SelectItem>
            </SelectContent>
          </Select>
          {!data.owner_id && (
            <p className="text-sm text-destructive mt-1">Deal owner is required</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealStep;
