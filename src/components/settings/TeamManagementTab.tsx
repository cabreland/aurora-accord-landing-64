import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Mail, 
  Shield, 
  MoreHorizontal,
  Clock,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { 
  useTeamInvitations, 
  useTeamStats, 
  useRevokeInvitation, 
  useResendInvitation,
  TeamInvitation
} from '@/hooks/useTeamInvitations';
import { useTeamMembers, getTeamMemberName, getTeamMemberInitials } from '@/hooks/useTeamMembers';
import EnhancedInviteMemberModal from '@/components/team/EnhancedInviteMemberModal';
import { cn } from '@/lib/utils';

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return 'destructive';
    case 'editor':
      return 'default';
    default:
      return 'secondary';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    case 'accepted':
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Accepted</Badge>;
    case 'expired':
      return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" /> Expired</Badge>;
    case 'revoked':
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Revoked</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const TeamManagementTab: React.FC = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  
  const { data: stats, isLoading: statsLoading } = useTeamStats();
  const { data: members, isLoading: membersLoading } = useTeamMembers();
  const { data: invitations, isLoading: invitationsLoading } = useTeamInvitations();
  const revokeInvitation = useRevokeInvitation();
  const resendInvitation = useResendInvitation();

  const handleRevoke = (invitation: TeamInvitation) => {
    if (confirm('Are you sure you want to revoke this invitation?')) {
      revokeInvitation.mutate(invitation.id);
    }
  };

  const handleResend = (invitation: TeamInvitation) => {
    resendInvitation.mutate(invitation);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.totalMembers || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.activeMembers || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Mail className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.pendingInvites || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Manage team members and send invitations
            </CardDescription>
          </div>
          <Button 
            onClick={() => setIsInviteModalOpen(true)}
            className="gap-2"
            size="lg"
          >
            <UserPlus className="h-4 w-4" />
            Invite Team Member
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                Members ({members?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-2">
                <Mail className="h-4 w-4" />
                Invitations ({invitations?.filter(i => i.status === 'pending').length || 0})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="members">
              {membersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={member.profile_picture_url || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm">
                                {getTeamMemberInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{getTeamMemberName(member)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                              <DropdownMenuItem>View Activity</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet</p>
                  <p className="text-sm">Invite your first team member to get started</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="invitations">
              {invitationsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : invitations && invitations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invitee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {invitation.invitee_name || invitation.invitee_email.split('@')[0]}
                            </p>
                            <p className="text-sm text-muted-foreground">{invitation.invitee_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{invitation.role}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invitation.inviter 
                            ? `${invitation.inviter.first_name || ''} ${invitation.inviter.last_name || ''}`.trim() || invitation.inviter.email
                            : 'Unknown'
                          }
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invitation.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {invitation.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleResend(invitation)}
                                    disabled={resendInvitation.isPending}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Resend Invitation
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleRevoke(invitation)}
                                    className="text-destructive"
                                    disabled={revokeInvitation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Revoke Invitation
                                  </DropdownMenuItem>
                                </>
                              )}
                              {invitation.status !== 'pending' && (
                                <DropdownMenuItem disabled>
                                  No actions available
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No invitations sent yet</p>
                  <p className="text-sm">Click "Invite Team Member" to send your first invitation</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <EnhancedInviteMemberModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        mode="platform"
      />
    </div>
  );
};

export default TeamManagementTab;