import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Search, AlertCircle } from 'lucide-react';
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<DealTeamRole>('analyst');
  const [permissions, setPermissions] = useState<TeamMemberPermissions>(DEFAULT_PERMISSIONS.analyst);
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searchResults, setSearchResults] = useState<FoundUser[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleRoleChange = (role: DealTeamRole) => {
    setSelectedRole(role);
    setPermissions(DEFAULT_PERMISSIONS[role]);
  };

  // Live search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const q = searchQuery.trim().toLowerCase();
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, first_name, last_name')
          .or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
          .limit(5);
        
        if (error) throw error;
        
        const results = (data || [])
          .filter(d => !existingMemberIds.includes(d.user_id))
          .map(d => ({
            id: d.user_id,
            email: d.email,
            first_name: d.first_name || undefined,
            last_name: d.last_name || undefined,
          }));
        
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchError('Failed to search for users');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, existingMemberIds]);

  const handleSelectUser = (user: FoundUser) => {
    setFoundUser(user);
    setSearchQuery(`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email);
    setShowDropdown(false);
    setSearchResults([]);
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
    setSearchQuery('');
    setSelectedRole('analyst');
    setPermissions(DEFAULT_PERMISSIONS.analyst);
    setFoundUser(null);
    setSearchResults([]);
    setSearchError(null);
    setShowDropdown(false);
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
            Search for an existing user by name or email and assign them a role.
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
            {/* Live Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search by name or email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Type a name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFoundUser(null);
                    setSearchError(null);
                  }}
                  className="pl-9"
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}

                {/* Dropdown Results */}
                {showDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0',
                          getAvatarColor(user.id)
                        )}>
                          {getUserInitials(user)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {user.first_name || user.last_name
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && !foundUser && (
                <p className="text-xs text-muted-foreground">No users found. They need to create an account first.</p>
              )}
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
