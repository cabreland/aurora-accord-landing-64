import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from 'lucide-react';
import type { TeamMember } from '@/hooks/useTeamMembers';

// Color palette for consistent avatar colors
const avatarColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
];

const getAvatarColor = (userId: string) => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

const getInitials = (member: TeamMember): string => {
  if (member.first_name && member.last_name) {
    return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
  }
  if (member.first_name) return member.first_name[0].toUpperCase();
  if (member.last_name) return member.last_name[0].toUpperCase();
  return member.email?.[0]?.toUpperCase() || '?';
};

const getDisplayName = (member: TeamMember): string => {
  if (member.first_name && member.last_name) return `${member.first_name} ${member.last_name}`;
  if (member.first_name) return member.first_name;
  if (member.last_name) return member.last_name;
  return member.email?.split('@')[0] || 'Unknown';
};

const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  return roleNames[role] || role;
};

interface MultiAssigneeSelectorProps {
  teamMembers: TeamMember[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  isLoading?: boolean;
}

const MultiAssigneeSelector: React.FC<MultiAssigneeSelectorProps> = ({
  teamMembers,
  selectedIds,
  onSelectionChange,
  isLoading = false,
}) => {
  const handleToggle = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onSelectionChange(selectedIds.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedIds, userId]);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Loading team members...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 py-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Team Members
        </p>
        {selectedIds.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>
      
      <ScrollArea className="h-[250px]">
        <div className="space-y-1 pr-2">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-gray-500 px-2 py-2">No team members found</p>
          ) : (
            teamMembers.map((member) => {
              const color = getAvatarColor(member.user_id);
              const isSelected = selectedIds.includes(member.user_id);
              
              return (
                <button
                  key={member.user_id}
                  className={`flex items-center gap-3 w-full px-2 py-2 rounded-md transition-colors text-left ${
                    isSelected 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-gray-100 border border-transparent'
                  }`}
                  onClick={() => handleToggle(member.user_id)}
                >
                  <Checkbox 
                    checked={isSelected}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  
                  <Avatar className="w-7 h-7">
                    {member.profile_picture_url && (
                      <AvatarImage src={member.profile_picture_url} alt={getDisplayName(member)} />
                    )}
                    <AvatarFallback className={`${color.bg} ${color.text} text-xs font-medium`}>
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {getDisplayName(member)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {getRoleDisplayName(member.role)}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
      
      {selectedIds.length > 0 && (
        <div className="pt-2 border-t border-gray-100 px-2">
          <p className="text-xs text-gray-500">
            {selectedIds.length} assignee{selectedIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiAssigneeSelector;
