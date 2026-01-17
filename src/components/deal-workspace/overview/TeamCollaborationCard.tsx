import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRoleDisplayName, getRoleColor } from '@/hooks/useDealTeam';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string;
  };
}

interface TeamCollaborationCardProps {
  teamMembers: TeamMember[];
  ownerName?: string;
  partnerTeams?: number;
  pendingInvites?: number;
  onAddTeamMember: () => void;
  onManageTeam: () => void;
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

const getUserInitials = (user: TeamMember['user']): string => {
  if (!user) return '?';
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email?.[0]?.toUpperCase() || '?';
};

const getUserName = (user: TeamMember['user']): string => {
  if (!user) return 'Unknown';
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return user.email || 'Unknown';
};

export const TeamCollaborationCard: React.FC<TeamCollaborationCardProps> = ({
  teamMembers,
  ownerName = 'Unknown',
  partnerTeams = 0,
  pendingInvites = 0,
  onAddTeamMember,
  onManageTeam,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team & Collaboration
          {teamMembers.length > 0 && (
            <Badge variant="secondary">{teamMembers.length}</Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onManageTeam}>
          Manage
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-xs">Deal Owner</p>
            <p className="font-medium truncate">{ownerName}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-xs">Team Members</p>
            <p className="font-medium">{teamMembers.length}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-xs">Pending Invites</p>
            <p className="font-medium">{pendingInvites}</p>
          </div>
        </div>

        {/* Team Member List */}
        {teamMembers.length === 0 ? (
          <div className="text-center py-6 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground mb-3">No team members yet</p>
            <Button variant="outline" size="sm" onClick={onAddTeamMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {teamMembers.slice(0, 4).map(member => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white',
                  getAvatarColor(member.user_id)
                )}>
                  {getUserInitials(member.user)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {getUserName(member.user)}
                  </p>
                  <Badge className={cn('text-xs', getRoleColor(member.role as any))}>
                    {getRoleDisplayName(member.role as any)}
                  </Badge>
                </div>
              </div>
            ))}
            {teamMembers.length > 4 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={onManageTeam}
              >
                +{teamMembers.length - 4} more
              </Button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onAddTeamMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button variant="outline" className="flex-1">
            <Building className="h-4 w-4 mr-2" />
            Assign Partner
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
