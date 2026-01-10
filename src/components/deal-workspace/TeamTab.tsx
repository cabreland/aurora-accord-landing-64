import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useDealTeam, 
  useRemoveTeamMember,
  useUpdateTeamMember,
  DealTeamRole, 
  getRoleDisplayName,
  DealTeamMember
} from '@/hooks/useDealTeam';
import { useAuth } from '@/hooks/useAuth';
import { 
  TeamStats, 
  MemberCard, 
  InviteMemberModal,
  MemberDetailModal 
} from './team';
import { cn } from '@/lib/utils';

interface TeamTabProps {
  dealId: string;
}

const roles: DealTeamRole[] = ['deal_lead', 'analyst', 'external_reviewer', 'investor', 'seller', 'advisor'];

export const TeamTab: React.FC<TeamTabProps> = ({ dealId }) => {
  const { user } = useAuth();
  const { data: teamMembers = [], isLoading } = useDealTeam(dealId);
  const removeMember = useRemoveTeamMember();
  const updateMember = useUpdateTeamMember();
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DealTeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<DealTeamRole | 'all'>('all');

  // Filter members
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = `${member.user?.first_name || ''} ${member.user?.last_name || ''}`.toLowerCase();
        const email = member.user?.email?.toLowerCase() || '';
        if (!name.includes(query) && !email.includes(query)) {
          return false;
        }
      }
      
      // Role filter
      if (roleFilter !== 'all' && member.role !== roleFilter) {
        return false;
      }
      
      return true;
    });
  }, [teamMembers, searchQuery, roleFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: teamMembers.length,
    active: teamMembers.filter(m => m.last_active).length,
    pending: 0, // Would come from invitations table
  }), [teamMembers]);

  const handleRemoveMember = (memberId: string) => {
    removeMember.mutate({ memberId, dealId });
  };

  const handleChangeRole = (memberId: string, newRole: DealTeamRole) => {
    updateMember.mutate({ memberId, dealId, role: newRole });
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-10" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Team Members
            {teamMembers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {teamMembers.length}
              </Badge>
            )}
          </CardTitle>
          <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Stats */}
          <TeamStats
            totalMembers={stats.total}
            activeMembers={stats.active}
            pendingInvitations={stats.pending}
          />

          {/* Search & Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as DealTeamRole | 'all')}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Members List */}
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6 shadow-inner">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              {teamMembers.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
                  <p className="text-muted-foreground max-w-sm mb-4">
                    Add team members to collaborate on this deal with granular permissions.
                  </p>
                  <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add First Member
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Try adjusting your search or filter criteria.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isCurrentUser={member.user_id === user?.id}
                  onViewDetails={() => setSelectedMember(member)}
                  onEditPermissions={() => setSelectedMember(member)}
                  onRemove={() => handleRemoveMember(member.id)}
                  onChangeRole={(role) => handleChangeRole(member.id, role)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <InviteMemberModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        dealId={dealId}
        existingMemberIds={teamMembers.map(m => m.user_id)}
      />

      {/* Member Detail Modal */}
      <MemberDetailModal
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        member={selectedMember}
        dealId={dealId}
        isCurrentUser={selectedMember?.user_id === user?.id}
      />
    </>
  );
};
