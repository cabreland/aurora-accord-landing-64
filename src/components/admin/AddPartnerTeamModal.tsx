import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, X, Mail, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TeamMember {
  email: string;
  firstName: string;
  lastName: string;
}

interface DefaultPermissions {
  can_upload_documents: boolean;
  can_edit_deal_info: boolean;
  can_answer_dd_questions: boolean;
  can_view_buyer_activity: boolean;
  can_message_buyers: boolean;
  can_approve_data_room: boolean;
}

interface AddPartnerTeamModalProps {
  onSuccess: () => void;
}

const AddPartnerTeamModal = ({ onSuccess }: AddPartnerTeamModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [teamName, setTeamName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [teamType, setTeamType] = useState<'deal_partner' | 'placement_agent'>('deal_partner');
  const [primaryContactEmail, setPrimaryContactEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: '', firstName: '', lastName: '' }
  ]);
  const [defaultPermissions, setDefaultPermissions] = useState<DefaultPermissions>({
    can_upload_documents: true,
    can_edit_deal_info: true,
    can_answer_dd_questions: true,
    can_view_buyer_activity: true,
    can_message_buyers: false,
    can_approve_data_room: false,
  });

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { email: '', firstName: '', lastName: '' }]);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const togglePermission = (key: keyof DefaultPermissions) => {
    setDefaultPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = (): string | null => {
    if (!teamName.trim()) return 'Team name is required';
    if (!companyName.trim()) return 'Company name is required';
    if (!primaryContactEmail.trim()) return 'Primary contact email is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(primaryContactEmail)) return 'Invalid primary contact email';
    
    const validMembers = teamMembers.filter(m => m.email.trim());
    if (validMembers.length === 0) return 'At least one team member is required';
    
    for (const member of validMembers) {
      if (!emailRegex.test(member.email)) {
        return `Invalid email: ${member.email}`;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the partner team
      const { data: teamData, error: teamError } = await supabase
        .from('partner_teams')
        .insert({
          team_name: teamName.trim(),
          company_name: companyName.trim(),
          primary_contact_email: primaryContactEmail.trim(),
          team_type: teamType,
        })
        .select()
        .single();

      if (teamError) {
        throw new Error(`Failed to create team: ${teamError.message}`);
      }

      const teamId = teamData.id;
      console.log('Created partner team:', teamId);

      // 2. Send invitations to team members
      const validMembers = teamMembers.filter(m => m.email.trim());
      const inviteResults = [];

      for (const member of validMembers) {
        try {
          const { data, error } = await supabase.functions.invoke('send-partner-invite', {
            body: {
              email: member.email.trim(),
              first_name: member.firstName.trim(),
              last_name: member.lastName.trim(),
              partner_team_id: teamId,
              team_name: teamName,
              company_name: companyName,
              default_permissions: defaultPermissions,
            }
          });

          if (error) {
            console.error(`Error inviting ${member.email}:`, error);
            inviteResults.push({ email: member.email, success: false, error: error.message });
          } else if (data?.error) {
            inviteResults.push({ email: member.email, success: false, error: data.error });
          } else {
            inviteResults.push({ email: member.email, success: true });
          }
        } catch (err: any) {
          console.error(`Error inviting ${member.email}:`, err);
          inviteResults.push({ email: member.email, success: false, error: err.message });
        }
      }

      const successCount = inviteResults.filter(r => r.success).length;
      const failCount = inviteResults.filter(r => !r.success).length;

      if (successCount > 0) {
        toast({
          title: 'Partner Team Created',
          description: `Team "${teamName}" created. ${successCount} invitation(s) sent.${failCount > 0 ? ` ${failCount} failed.` : ''} Next: Assign this team to deals.`,
        });
      } else {
        toast({
          title: 'Team Created',
          description: `Team "${teamName}" created but invitations failed to send. You can manually invite members later.`,
          variant: 'destructive',
        });
      }

      // Reset form and close
      resetForm();
      setIsOpen(false);
      onSuccess();

    } catch (error: any) {
      console.error('Error creating partner team:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create partner team',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setCompanyName('');
    setTeamType('deal_partner');
    setPrimaryContactEmail('');
    setTeamMembers([{ email: '', firstName: '', lastName: '' }]);
    setDefaultPermissions({
      can_upload_documents: true,
      can_edit_deal_info: true,
      can_answer_dd_questions: true,
      can_view_buyer_activity: true,
      can_message_buyers: false,
      can_approve_data_room: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Building2 className="w-4 h-4 mr-2" />
          Add Partner Team
        </Button>
      </DialogTrigger>
      <DialogContent className="z-50 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Add Partner Team
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Team Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="e.g., Savvy Capital"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Savvy Capital LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamType">Team Type</Label>
                <Select value={teamType} onValueChange={(v: 'deal_partner' | 'placement_agent') => setTeamType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deal_partner">Deal Partner</SelectItem>
                    <SelectItem value="placement_agent">Placement Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="primaryEmail">Primary Contact Email</Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  placeholder="contact@savvycapital.com"
                  value={primaryContactEmail}
                  onChange={(e) => setPrimaryContactEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Team Members</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                <Plus className="w-4 h-4 mr-1" />
                Add Member
              </Button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/50">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      placeholder="First name"
                      value={member.firstName}
                      onChange={(e) => updateTeamMember(index, 'firstName', e.target.value)}
                    />
                    <Input
                      placeholder="Last name"
                      value={member.lastName}
                      onChange={(e) => updateTeamMember(index, 'lastName', e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      required={index === 0}
                    />
                  </div>
                  {teamMembers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMember(index)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Team members will receive an email invitation to join the platform.
            </p>
          </div>

          {/* Default Permissions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Default Permissions</h3>
            <p className="text-xs text-muted-foreground">
              These permissions will be applied when the team is assigned to deals.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={defaultPermissions.can_upload_documents}
                  onCheckedChange={() => togglePermission('can_upload_documents')}
                />
                <span className="text-sm">Can upload documents</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={defaultPermissions.can_edit_deal_info}
                  onCheckedChange={() => togglePermission('can_edit_deal_info')}
                />
                <span className="text-sm">Can edit deal information</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={defaultPermissions.can_answer_dd_questions}
                  onCheckedChange={() => togglePermission('can_answer_dd_questions')}
                />
                <span className="text-sm">Can answer DD questions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={defaultPermissions.can_view_buyer_activity}
                  onCheckedChange={() => togglePermission('can_view_buyer_activity')}
                />
                <span className="text-sm">Can view buyer activity</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={defaultPermissions.can_message_buyers}
                  onCheckedChange={() => togglePermission('can_message_buyers')}
                />
                <span className="text-sm">Can message buyers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={defaultPermissions.can_approve_data_room}
                  onCheckedChange={() => togglePermission('can_approve_data_room')}
                />
                <span className="text-sm">Can approve data room</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Create Team & Send Invites
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartnerTeamModal;
