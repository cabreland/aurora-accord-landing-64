import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { User, Users, MessageSquare, Briefcase, Crown } from 'lucide-react';
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
        <p className="text-sm text-muted-foreground">
          Provide information about the leadership team and founder's perspective on the business.
        </p>
      </div>

      <div className="space-y-6">
        {/* Founder Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="founder_name" className="text-sm font-medium flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Founder/Owner Name
            </Label>
            <Input
              id="founder_name"
              placeholder="e.g. John Smith"
              value={data.founder_name}
              onChange={(e) => onChange({ founder_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="founder_title" className="text-sm font-medium">
              Founder Title/Role
            </Label>
            <Input
              id="founder_title"
              placeholder="e.g. CEO & Founder, Owner-Operator"
              value={data.founder_title}
              onChange={(e) => onChange({ founder_title: e.target.value })}
            />
          </div>
        </div>

        {/* Founder's Message */}
        <div className="space-y-2">
          <Label htmlFor="founders_message" className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Founder's Message to Investors
          </Label>
          <Textarea
            id="founders_message"
            placeholder="A personal message from the founder/owner to potential investors about the business, its potential, and their vision..."
            value={data.founders_message}
            onChange={(e) => onChange({ founders_message: e.target.value })}
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Personal message that helps investors connect with the opportunity and founder's vision
          </p>
        </div>

        {/* Team Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="management_experience" className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Management Experience
            </Label>
            <Input
              id="management_experience"
              placeholder="e.g. 20+ years industry experience"
              value={data.management_experience}
              onChange={(e) => onChange({ management_experience: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_size" className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Current Team Size
            </Label>
            <Input
              id="team_size"
              placeholder="e.g. 15 employees, 5-person core team"
              value={data.team_size}
              onChange={(e) => onChange({ team_size: e.target.value })}
            />
          </div>
        </div>

        {/* Key Personnel */}
        <div className="space-y-2">
          <Label htmlFor="key_personnel" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Key Personnel & Roles
          </Label>
          <Textarea
            id="key_personnel"
            placeholder="Describe key team members, their roles, experience, and how they contribute to business success..."
            value={data.key_personnel}
            onChange={(e) => onChange({ key_personnel: e.target.value })}
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Highlight critical team members who drive business success and would stay with new ownership
          </p>
        </div>
      </div>

      {/* Team Summary Card */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Leadership & Team Overview</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Founder:</span> {data.founder_name || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Role:</span> {data.founder_title || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Team Size:</span> {data.team_size || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Experience:</span> {data.management_experience || 'Not specified'}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Founder's Message:</span> {
                data.founders_message 
                  ? `${data.founders_message.slice(0, 100)}${data.founders_message.length > 100 ? '...' : ''}` 
                  : 'No message provided'
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
          A compelling founder's message and strong team credentials significantly increase investor interest. 
          Consider highlighting unique backgrounds, industry expertise, and previous successes.
        </p>
      </div>
    </div>
  );
};