import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DealFormData } from './DealWizard';

interface FounderTeamStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

export const FounderTeamStep: React.FC<FounderTeamStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Founder & Team</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Showcase the leadership team and provide insights from the founder.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="founder_message">Founder's Message</Label>
          <Textarea
            id="founder_message"
            value={data.founder_message}
            onChange={(e) => onChange({ founder_message: e.target.value })}
            placeholder="A personal message from the founder about the business, vision, and why now is the right time for this opportunity..."
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            This personal message will be featured prominently in the investor presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="team_size">Team Size</Label>
            <Input
              id="team_size"
              value={data.team_size}
              onChange={(e) => onChange({ team_size: e.target.value })}
              placeholder="e.g., 45 employees"
            />
            <p className="text-xs text-muted-foreground">
              Total number of employees or team members
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="management_experience">Management Experience</Label>
            <Input
              id="management_experience"
              value={data.management_experience}
              onChange={(e) => onChange({ management_experience: e.target.value })}
              placeholder="e.g., 15+ years combined experience"
            />
            <p className="text-xs text-muted-foreground">
              Combined years of industry experience
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="key_personnel">Key Personnel</Label>
          <Textarea
            id="key_personnel"
            value={data.key_personnel}
            onChange={(e) => onChange({ key_personnel: e.target.value })}
            placeholder="Highlight key team members, their roles, backgrounds, and what they bring to the business..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Focus on leadership team members and their relevant experience.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Team Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Team Size:</span>
            <span className="ml-2 font-medium">
              {data.team_size || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Experience:</span>
            <span className="ml-2 font-medium">
              {data.management_experience || 'Not specified'}
            </span>
          </div>
        </div>
        {data.founder_message && (
          <div className="mt-3">
            <span className="text-muted-foreground">Founder's Message:</span>
            <span className="ml-2 text-primary">✓ Added</span>
          </div>
        )}
        {data.key_personnel && (
          <div className="mt-1">
            <span className="text-muted-foreground">Key Personnel:</span>
            <span className="ml-2 text-primary">✓ Detailed</span>
          </div>
        )}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="font-medium text-primary mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-muted-foreground">
          A compelling founder's message and strong team credentials significantly increase investor interest. 
          Consider highlighting unique backgrounds, industry expertise, and previous successes.
        </p>
      </div>
    </div>
  );
};