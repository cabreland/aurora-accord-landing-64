import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  ShieldCheck, 
  User, 
  Eye, 
  Briefcase, 
  UserCheck
} from 'lucide-react';
import { DealTeamRole } from '@/hooks/useDealTeam';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: DealTeamRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const roleConfig: Record<DealTeamRole, { 
  label: string; 
  icon: React.ElementType; 
  className: string;
  description: string;
}> = {
  deal_lead: {
    label: 'Deal Lead',
    icon: Crown,
    className: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-700',
    description: 'Full access to manage the deal',
  },
  analyst: {
    label: 'Analyst',
    icon: UserCheck,
    className: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-green-300 dark:text-green-400 dark:border-green-700',
    description: 'Can upload, create requests, and edit',
  },
  external_reviewer: {
    label: 'Reviewer',
    icon: ShieldCheck,
    className: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-700 border-purple-300 dark:text-purple-400 dark:border-purple-700',
    description: 'Can review and approve documents',
  },
  investor: {
    label: 'Investor',
    icon: Briefcase,
    className: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-700',
    description: 'View-only access to approved materials',
  },
  seller: {
    label: 'Seller',
    icon: User,
    className: 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 border-orange-300 dark:text-orange-400 dark:border-orange-700',
    description: 'Can upload and view documents',
  },
  advisor: {
    label: 'Advisor',
    icon: Eye,
    className: 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-700 border-cyan-300 dark:text-cyan-400 dark:border-cyan-700',
    description: 'Can view and comment on materials',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const config = roleConfig[role] || roleConfig.analyst;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center font-medium border',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};

export const getRoleDescription = (role: DealTeamRole): string => {
  return roleConfig[role]?.description || '';
};

export const getRoleIcon = (role: DealTeamRole): React.ElementType => {
  return roleConfig[role]?.icon || User;
};
