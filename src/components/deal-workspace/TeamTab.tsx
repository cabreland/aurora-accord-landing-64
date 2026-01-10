import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Trash2, 
  Edit,
  Shield,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  useDealTeam, 
  useAddTeamMember, 
  useRemoveTeamMember,
  useUpdateTeamMember,
  DealTeamRole, 
  getRoleDisplayName, 
  getRoleColor 
} from '@/hooks/useDealTeam';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TeamTabProps {
  dealId: string;
}

const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
  ];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
};

const getUserInitials = (user: { first_name?: string | null; last_name?: string | null; email?: string }): string => {
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email?.[0]?.toUpperCase() || '?';
};

const roles: DealTeamRole[] = ['deal_lead', 'analyst', 'external_reviewer', 'investor', 'seller', 'advisor'];

export const TeamTab: React.FC<TeamTabProps> = ({ dealId }) => {
  const { data: teamMembers = [], isLoading } = useDealTeam(dealId);
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const updateMember = useUpdateTeamMember();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<DealTeamRole>('analyst');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; first_name?: string; last_name?: string } | null>(null);

  const handleSearchUser = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setFoundUser({
          id: data.user_id,
          email: data.email,
          first_name: data.first_name || undefined,
          last_name: data.last_name || undefined,
        });
      } else {
        toast.error('No user found with that email');
        setFoundUser(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Failed to search for user');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = () => {
    if (!foundUser) {
      toast.error('Please search for a user first');
      return;
    }
    
    // Check if already a member
    if (teamMembers.some(m => m.user_id === foundUser.id)) {
      toast.error('This user is already a team member');
      return;
    }
    
    addMember.mutate(
      { dealId, userId: foundUser.id, role: selectedRole },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setEmail('');
          setFoundUser(null);
          setSelectedRole('analyst');
        },
      }
    );
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      removeMember.mutate({ memberId, dealId });
    }
  };

  const handleChangeRole = (memberId: string, newRole: DealTeamRole) => {
    updateMember.mutate({ memberId, dealId, role: newRole });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
            {teamMembers.length > 0 && (
              <Badge variant="secondary">{teamMembers.length}</Badge>
            )}
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No team members yet</h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                Add team members to collaborate on this deal.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium text-white',
                    getAvatarColor(member.user_id)
                  )}>
                    {member.user ? getUserInitials(member.user) : '?'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {member.user?.first_name || member.user?.last_name 
                        ? `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim()
                        : 'Unknown User'
                      }
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.user?.email || 'No email'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn('text-xs', getRoleColor(member.role))}>
                        {getRoleDisplayName(member.role)}
                      </Badge>
                      {member.permissions.can_approve_documents && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Approver
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground text-right">
                    <p>Added {formatDistanceToNow(new Date(member.added_at), { addSuffix: true })}</p>
                    {member.last_active && (
                      <p className="text-xs">
                        Last active {formatDistanceToNow(new Date(member.last_active), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center gap-2" disabled>
                        <Edit className="h-4 w-4" />
                        Edit Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {roles.map(role => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleChangeRole(member.id, role)}
                          className={cn(member.role === role && 'bg-muted')}
                        >
                          Set as {getRoleDisplayName(role)}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFoundUser(null);
                  }}
                />
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={handleSearchUser}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {foundUser && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white',
                    getAvatarColor(foundUser.id)
                  )}>
                    {getUserInitials(foundUser)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {foundUser.first_name || foundUser.last_name 
                        ? `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim()
                        : foundUser.email
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as DealTeamRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember}
              disabled={!foundUser || addMember.isPending}
            >
              {addMember.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
