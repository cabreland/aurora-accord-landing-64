import React, { useState } from 'react';
import { UserPlus, Search, Mail, AlertCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DealTeamRole, 
  TeamMemberPermissions,
  getRoleDisplayName,
  useAddTeamMember
} from '@/hooks/useDealTeam';
import { PermissionEditor } from './PermissionEditor';
import { RoleBadge, getRoleDescription } from './RoleBadge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  existingMemberIds: string[];
}

const roles: DealTeamRole[] = ['deal_lead', 'analyst', 'external_reviewer', 'investor', 'seller', 'advisor'];

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

interface FoundUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-green-500 to-emerald-600',
    'bg-gradient-to-br from-purple-500 to-violet-600',
  ];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
};

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  open,
  onOpenChange,
  dealId,
  existingMemberIds,
}) => {
  const addMember = useAddTeamMember();
  
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<DealTeamRole>('analyst');
  const [permissions, setPermissions] = useState<TeamMemberPermissions>(DEFAULT_PERMISSIONS.analyst);
  const [customMessage, setCustomMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleRoleChange = (role: DealTeamRole) => {
    setSelectedRole(role);
    setPermissions(DEFAULT_PERMISSIONS[role]);
  };

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
        }
      } else {
        setSearchError('No user found with this email. They need to create an account first.');
        setFoundUser(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setSearchError('Failed to search for user');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = () => {
    if (!foundUser) return;
    
    addMember.mutate(
      { 
        dealId, 
        userId: foundUser.id, 
        role: selectedRole,
        permissions 
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setEmail('');
    setSelectedRole('analyst');
    setPermissions(DEFAULT_PERMISSIONS.analyst);
    setCustomMessage('');
    setFoundUser(null);
    setSearchError(null);
  };

  const getUserInitials = (user: FoundUser): string => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    if (first || last) return `${first}${last}`.toUpperCase();
    return user.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Search for an existing user by email and assign them a role.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="user" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Find User</TabsTrigger>
            <TabsTrigger value="permissions" disabled={!foundUser}>
              Permissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="space-y-4 mt-4">
            {/* Email Search */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFoundUser(null);
                      setSearchError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                    className="pl-9"
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

            {/* Search Error */}
            {searchError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}

            {/* Found User Card */}
            {foundUser && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium text-white',
                    getAvatarColor(foundUser.id)
                  )}>
                    {getUserInitials(foundUser)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {foundUser.first_name || foundUser.last_name 
                        ? `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim()
                        : foundUser.email.split('@')[0]
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(v) => handleRoleChange(v as DealTeamRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <span>{getRoleDisplayName(role)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 mt-2">
                <RoleBadge role={selectedRole} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {getRoleDescription(selectedRole)}
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="permissions" className="mt-4">
            <PermissionEditor
              permissions={permissions}
              onChange={setPermissions}
              role={selectedRole}
              onResetToDefault={() => setPermissions(DEFAULT_PERMISSIONS[selectedRole])}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!foundUser || addMember.isPending}
          >
            {addMember.isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
