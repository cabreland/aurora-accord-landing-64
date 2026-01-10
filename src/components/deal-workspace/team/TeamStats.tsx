import React from 'react';
import { Users, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamStatsProps {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
}

export const TeamStats: React.FC<TeamStatsProps> = ({
  totalMembers,
  activeMembers,
  pendingInvitations,
}) => {
  const stats = [
    {
      label: 'Total Members',
      value: totalMembers,
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Active',
      value: activeMembers,
      icon: CheckCircle,
      color: 'from-green-500/20 to-emerald-500/20 text-green-600 border-green-200',
      iconBg: 'bg-green-500/10',
    },
    {
      label: 'Pending Invites',
      value: pendingInvitations,
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-200',
      iconBg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              'relative overflow-hidden rounded-xl border p-4',
              'bg-gradient-to-br',
              stat.color
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={cn('p-2.5 rounded-lg', stat.iconBg)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
