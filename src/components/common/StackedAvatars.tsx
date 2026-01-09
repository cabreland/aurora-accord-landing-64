import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { User } from 'lucide-react';

// Color palette for consistent avatar colors
const avatarColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
];

const getAvatarColor = (userId: string) => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

const getInitials = (firstName: string | null, lastName: string | null, email: string | undefined): string => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName[0].toUpperCase();
  if (lastName) return lastName[0].toUpperCase();
  return email?.[0]?.toUpperCase() || '?';
};

const getDisplayName = (firstName: string | null, lastName: string | null, email: string | undefined): string => {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return email?.split('@')[0] || 'Unknown';
};

export interface AssigneeInfo {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  profile_picture_url: string | null;
  role?: string;
}

interface StackedAvatarsProps {
  assignees: AssigneeInfo[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { avatar: 'w-6 h-6', text: 'text-[10px]', overlap: '-ml-2' },
  md: { avatar: 'w-8 h-8', text: 'text-xs', overlap: '-ml-3' },
  lg: { avatar: 'w-10 h-10', text: 'text-sm', overlap: '-ml-4' },
};

const StackedAvatars: React.FC<StackedAvatarsProps> = ({
  assignees,
  maxVisible = 3,
  size = 'sm',
  showTooltip = true,
  className = '',
}) => {
  const sizeClass = sizeClasses[size];
  
  if (!assignees || assignees.length === 0) {
    return (
      <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
        <div className={`${sizeClass.avatar} rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-gray-50`}>
          <User className="w-3 h-3 text-gray-400" />
        </div>
        <span className="text-xs text-gray-400">Unassigned</span>
      </div>
    );
  }

  const visibleAssignees = assignees.slice(0, maxVisible);
  const remainingCount = assignees.length - maxVisible;
  const allNames = assignees.map(a => getDisplayName(a.first_name, a.last_name, a.email)).join(', ');

  const AvatarGroup = (
    <div className={`flex items-center ${className}`}>
      {visibleAssignees.map((assignee, index) => {
        const color = getAvatarColor(assignee.user_id);
        const initials = getInitials(assignee.first_name, assignee.last_name, assignee.email);
        
        return (
          <Avatar 
            key={assignee.user_id}
            className={`${sizeClass.avatar} border-2 border-white ring-1 ring-gray-200 ${index > 0 ? sizeClass.overlap : ''}`}
          >
            {assignee.profile_picture_url && (
              <AvatarImage 
                src={assignee.profile_picture_url} 
                alt={getDisplayName(assignee.first_name, assignee.last_name, assignee.email)} 
              />
            )}
            <AvatarFallback className={`${color.bg} ${color.text} ${sizeClass.text} font-medium`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      })}
      
      {remainingCount > 0 && (
        <div 
          className={`${sizeClass.avatar} ${sizeClass.overlap} rounded-full border-2 border-white ring-1 ring-gray-200 bg-gray-100 flex items-center justify-center`}
        >
          <span className={`${sizeClass.text} font-medium text-gray-600`}>+{remainingCount}</span>
        </div>
      )}
    </div>
  );

  if (!showTooltip) {
    return AvatarGroup;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {AvatarGroup}
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 text-white text-xs max-w-xs">
          <p className="font-medium">Assigned to:</p>
          <p className="text-gray-300">{allNames}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StackedAvatars;
