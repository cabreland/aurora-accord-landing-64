import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreVertical, 
  Trash2, 
  Edit,
  Shield,
  Mail,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DealTeamMember, DealTeamRole, getRoleDisplayName } from '@/hooks/useDealTeam';
import { RoleBadge } from './RoleBadge';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: DealTeamMember;
  onEditPermissions: () => void;
  onRemove: () => void;
  onViewDetails: () => void;
  onChangeRole: (role: DealTeamRole) => void;
  isCurrentUser?: boolean;
}

const roles: DealTeamRole[] = ['deal_lead', 'analyst', 'external_reviewer', 'investor', 'seller', 'advisor'];

const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-green-500 to-emerald-600',
    'bg-gradient-to-br from-purple-500 to-violet-600',
    'bg-gradient-to-br from-orange-500 to-red-600',
    'bg-gradient-to-br from-pink-500 to-rose-600',
    'bg-gradient-to-br from-cyan-500 to-teal-600',
    'bg-gradient-to-br from-amber-500 to-yellow-600',
  ];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
};

const getUserInitials = (user: DealTeamMember['user']): string => {
  if (!user) return '?';
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email?.[0]?.toUpperCase() || '?';
};

const getUserName = (user: DealTeamMember['user']): string => {
  if (!user) return 'Unknown User';
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return user.email?.split('@')[0] || 'Unknown';
};

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEditPermissions,
  onRemove,
  onViewDetails,
  onChangeRole,
  isCurrentUser = false,
}) => {
  const permissionCount = Object.values(member.permissions).filter(
    (v) => typeof v === 'boolean' && v === true
  ).length;

  return (
    <div 
      className={cn(
        'group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
        'bg-card hover:bg-muted/50 hover:shadow-md',
        isCurrentUser && 'ring-2 ring-primary/20'
      )}
    >
      {/* Avatar */}
      <div 
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white shadow-lg',
          getAvatarColor(member.user_id)
        )}
      >
        {getUserInitials(member.user)}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground truncate">
            {getUserName(member.user)}
          </p>
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs">You</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
          <Mail className="h-3 w-3" />
          <span className="truncate">{member.user?.email || 'No email'}</span>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <RoleBadge role={member.role} size="sm" />
          
          {member.permissions.can_approve_documents && (
            <Badge variant="outline" className="text-xs gap-1 border-green-200 text-green-700 bg-green-50">
              <Shield className="h-3 w-3" />
              Approver
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground">
            {permissionCount} permissions
          </span>
        </div>
      </div>
      
      {/* Activity Info */}
      <div className="hidden sm:block text-right text-sm">
        <div className="flex items-center gap-1 text-muted-foreground justify-end">
          <Clock className="h-3 w-3" />
          <span>Added {formatDistanceToNow(new Date(member.added_at), { addSuffix: true })}</span>
        </div>
        {member.last_active && (
          <p className="text-xs text-muted-foreground mt-1">
            Active {formatDistanceToNow(new Date(member.last_active), { addSuffix: true })}
          </p>
        )}
      </div>
      
      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onViewDetails} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEditPermissions} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Permissions
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Change Role
          </div>
          {roles.map(role => (
            <DropdownMenuItem
              key={role}
              onClick={() => onChangeRole(role)}
              className={cn(
                'gap-2',
                member.role === role && 'bg-muted'
              )}
            >
              {getRoleDisplayName(role)}
              {member.role === role && <span className="ml-auto text-xs">Current</span>}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={onRemove}
            className="text-destructive focus:text-destructive gap-2"
            disabled={isCurrentUser}
          >
            <Trash2 className="h-4 w-4" />
            Remove Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
