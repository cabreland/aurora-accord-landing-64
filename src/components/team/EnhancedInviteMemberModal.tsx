import React, { useState } from 'react';
import { UserPlus, Search, Mail, AlertCircle, Send, Users, Shield, Eye, FileText, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useSendTeamInvitation } from '@/hooks/useTeamInvitations';
import { useAddTeamMember, DealTeamRole, TeamMemberPermissions, getRoleDisplayName } from '@/hooks/useDealTeam';

interface EnhancedInviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId?: string;
  existingMemberIds?: string[];
  mode?: 'deal' | 'platform';
}

interface FoundUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// Role configurations
const platformRoles = [
  { 
    value: 'admin', 
    label: 'Administrator', 
    icon: Shield,
    description: 'Full access to all platform features',
    color: 'from-red-500 to-rose-600'
  },
  { 
    value: 'editor', 
    label: 'Editor', 
    icon: FileText,
    description: 'Can create and manage deals and companies',
    color: 'from-blue-500 to-indigo-600'
  },
  { 
    value: 'viewer', 
    label: 'Viewer', 
    icon: Eye,
    description: 'Read-only access to assigned deals',
    color: 'from-gray-500 to-slate-600'
  },
];

const dealRoles: { value: DealTeamRole; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { 
    value: 'deal_lead', 
    label: 'Deal Lead', 
    icon: Shield,
    description: 'Full control over the deal',
    color: 'from-purple-500 to-violet-600'
  },
  { 
    value: 'analyst', 
    label: 'Analyst', 
    icon: FileText,
    description: 'Create requests, upload documents',
    color: 'from-blue-500 to-indigo-600'
  },
  { 
    value: 'advisor', 
    label: 'Advisor', 
    icon: Users,
    description: 'Collaborate on due diligence',
    color: 'from-green-500 to-emerald-600'
  },
  { 
    value: 'external_reviewer', 
    label: 'External Reviewer', 
    icon: Eye,
    description: 'Review and approve documents',
    color: 'from-amber-500 to-orange-600'
  },
];

const DEFAULT_PERMISSIONS: Record<DealTeamRole, TeamMemberPermissions> = {
  deal_lead: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: true,
    can_create_requests: true,
    can_edit_requests: true,
    can_approve_documents: true,
    restricted_folders: [],
  },
  analyst: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: false,
    can_create_requests: true,
    can_edit_requests: true,
    can_approve_documents: false,
    restricted_folders: [],
  },
  external_reviewer: {
    can_view_all_folders: false,
    can_upload_documents: false,
    can_delete_documents: false,
    can_create_requests: false,
    can_edit_requests: false,
    can_approve_documents: true,
    restricted_folders: [],
  },
  investor: {
    can_view_all_folders: false,
    can_upload_documents: false,
    can_delete_documents: false,
    can_create_requests: false,
    can_edit_requests: false,
    can_approve_documents: false,
    restricted_folders: [],
  },
  seller: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: false,
    can_create_requests: false,
    can_edit_requests: false,
    can_approve_documents: false,
    restricted_folders: [],
  },
  advisor: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: false,
    can_create_requests: true,
    can_edit_requests: true,
    can_approve_documents: false,
    restricted_folders: [],
  },
};

export const EnhancedInviteMemberModal: React.FC<EnhancedInviteMemberModalProps> = ({
  open,
  onOpenChange,
  dealId,
  existingMemberIds = [],
  mode = 'platform',
}) => {
  const sendInvitation = useSendTeamInvitation();
  const addDealMember = useAddTeamMember();
  
  const [inviteMode, setInviteMode] = useState<'email' | 'existing'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(mode === 'deal' ? 'analyst' : 'viewer');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'role' | 'message'>('details');

  const roles = mode === 'deal' ? dealRoles : platformRoles;

  const handleSearchUser = async () => {
    if (!email.trim()) {
      setSearchError('Please enter an email address');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        if (existingMemberIds.includes(data.user_id)) {
          setSearchError('This user is already a team member');
          setFoundUser(null);
        } else {
          setFoundUser({
            id: data.user_id,
            email: data.email,
            first_name: data.first_name || undefined,
            last_name: data.last_name || undefined,
          });
          setName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
        }
      } else {
        if (inviteMode === 'existing') {
          setSearchError('No user found with this email. Switch to "Invite by Email" to send an invitation.');
        }
        setFoundUser(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setSearchError('Failed to search for user');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'deal' && dealId && foundUser) {
      // Add existing user to deal team
      addDealMember.mutate(
        { 
          dealId, 
          userId: foundUser.id, 
          role: selectedRole as DealTeamRole,
          permissions: DEFAULT_PERMISSIONS[selectedRole as DealTeamRole]
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            resetForm();
          },
        }
      );
    } else {
      // Send email invitation
      sendInvitation.mutate(
        {
          invitee_email: email.trim(),
          invitee_name: name.trim() || undefined,
          role: selectedRole,
          personal_message: personalMessage.trim() || undefined,
          deal_id: dealId || undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            resetForm();
          },
        }
      );
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setPersonalMessage('');
    setSelectedRole(mode === 'deal' ? 'analyst' : 'viewer');
    setFoundUser(null);
    setSearchError(null);
    setStep('details');
    setInviteMode('email');
  };

  const getUserInitials = (user: FoundUser): string => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    if (first || last) return `${first}${last}`.toUpperCase();
    return user.email?.[0]?.toUpperCase() || '?';
  };

  const canProceed = () => {
    if (step === 'details') {
      if (inviteMode === 'existing') return !!foundUser;
      return !!email.trim();
    }
    if (step === 'role') return !!selectedRole;
    return true;
  };

  const isPending = sendInvitation.isPending || addDealMember.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            {mode === 'deal' ? 'Add Team Member' : 'Invite Team Member'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'deal' 
              ? 'Add a user to collaborate on this deal'
              : 'Invite someone to join the platform'
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 py-2">
          {['details', 'role', 'message'].map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(s as any)}
                disabled={s === 'role' && !canProceed() && step === 'details'}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                  step === s 
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">
                  {i + 1}
                </span>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
              {i < 2 && <div className="h-px w-4 bg-border" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <Tabs value={inviteMode} onValueChange={(v) => setInviteMode(v as 'email' | 'existing')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Invite by Email
                </TabsTrigger>
                <TabsTrigger value="existing" className="gap-2">
                  <Users className="h-4 w-4" />
                  Add Existing User
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="existing" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="search-email">Search by Email</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search-email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFoundUser(null);
                          setSearchError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={handleSearchUser}
                      disabled={isSearching}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>

                {searchError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{searchError}</AlertDescription>
                  </Alert>
                )}

                {foundUser && (
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg font-medium text-white">
                        {getUserInitials(foundUser)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          {foundUser.first_name || foundUser.last_name 
                            ? `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim()
                            : foundUser.email.split('@')[0]
                          }
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </p>
                        <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {step === 'role' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a role for {name || email}</p>
            <div className="grid gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'p-2.5 rounded-lg bg-gradient-to-br text-white',
                      role.color
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{role.label}</h4>
                        {isSelected && (
                          <Badge variant="default" className="text-xs">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{role.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Personal Message */}
        {step === 'message' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal note to your invitation..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This message will be included in the invitation email
              </p>
            </div>

            {/* Summary Card */}
            <Card className="p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-3">Invitation Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{email}</span>
                </div>
                {name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="secondary">
                    {roles.find(r => r.value === selectedRole)?.label || selectedRole}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          {step !== 'details' && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step === 'message' ? 'role' : 'details')}
              className="w-full sm:w-auto"
            >
              Back
            </Button>
          )}
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            
            {step === 'message' ? (
              <Button 
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 sm:flex-none gap-2"
              >
                <Send className="h-4 w-4" />
                {isPending ? 'Sending...' : foundUser && mode === 'deal' ? 'Add Member' : 'Send Invitation'}
              </Button>
            ) : (
              <Button 
                onClick={() => setStep(step === 'details' ? 'role' : 'message')}
                disabled={!canProceed()}
                className="flex-1 sm:flex-none"
              >
                Continue
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedInviteMemberModal;