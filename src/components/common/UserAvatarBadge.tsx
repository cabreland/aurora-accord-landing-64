import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Color palette for user avatars based on user ID
const avatarColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
];

export interface UserAvatarBadgeProps {
  userId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profilePictureUrl?: string | null;
  role?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showName?: boolean;
  className?: string;
}

/**
 * Get consistent color for a user based on their ID
 */
export const getAvatarColor = (userId: string | null | undefined) => {
  if (!userId) return avatarColors[0];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

/**
 * Generate initials from user name
 */
export const getUserInitials = (
  firstName?: string | null, 
  lastName?: string | null, 
  email?: string | null
): string => {
  const first = firstName?.trim();
  const last = lastName?.trim();
  
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first[0].toUpperCase();
  if (last) return last[0].toUpperCase();
  if (email) return email[0].toUpperCase();
  
  return '?';
};

/**
 * Get display name for a user
 */
export const getUserDisplayName = (
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
): string => {
  const first = firstName?.trim();
  const last = lastName?.trim();
  
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  if (email) return email.split('@')[0];
  
  return 'Unknown User';
};

/**
 * Get human-readable role name
 */
export const getRoleDisplayName = (role?: string | null): string => {
  if (!role) return '';
  
  const roleNames: Record<string, string> = {
    super_admin: 'Super Administrator',
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer',
    investor: 'Investor',
  };
  
  return roleNames[role] || role;
};

const sizeClasses = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

const UserAvatarBadge: React.FC<UserAvatarBadgeProps> = ({
  userId,
  firstName,
  lastName,
  email,
  profilePictureUrl,
  role,
  size = 'md',
  showTooltip = true,
  showName = false,
  className,
}) => {
  const initials = getUserInitials(firstName, lastName, email);
  const displayName = getUserDisplayName(firstName, lastName, email);
  const roleDisplay = getRoleDisplayName(role);
  const color = getAvatarColor(userId);
  
  const isUnassigned = !userId;
  
  const avatarElement = (
    <div className={cn("flex items-center gap-2", className)}>
      {isUnassigned ? (
        <div className={cn(
          "rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50",
          sizeClasses[size]
        )}>
          <User className={cn(
            "text-gray-400",
            size === 'xs' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
          )} />
        </div>
      ) : (
        <Avatar className={cn(
          "border-2 border-white shadow-sm",
          sizeClasses[size]
        )}>
          {profilePictureUrl && (
            <AvatarImage src={profilePictureUrl} alt={displayName} />
          )}
          <AvatarFallback className={cn(
            color.bg, 
            color.text, 
            "font-medium"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      
      {showName && (
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "text-gray-900 truncate",
            size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {isUnassigned ? 'Unassigned' : displayName}
          </span>
          {roleDisplay && !isUnassigned && (
            <span className="text-xs text-gray-500 truncate">{roleDisplay}</span>
          )}
        </div>
      )}
    </div>
  );
  
  if (!showTooltip || (isUnassigned && !showName)) {
    return avatarElement;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {avatarElement}
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 text-white text-xs">
          <p className="font-medium">{isUnassigned ? 'Unassigned' : displayName}</p>
          {roleDisplay && !isUnassigned && (
            <p className="text-gray-400">{roleDisplay}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserAvatarBadge;
