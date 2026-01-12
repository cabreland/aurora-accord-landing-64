import React from 'react';
import { Activity, MessageSquare, FileText, CheckCircle, UserPlus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'note' | 'document' | 'status' | 'invite';
  description: string;
  dealId?: string;
  timestamp: string;
}

const mockActivities: ActivityItem[] = [
  { id: '1', type: 'note', description: 'Jack added note to Deal 42 – Review financials', dealId: 'deal-42', timestamp: '2h ago' },
  { id: '2', type: 'status', description: 'NewCo LOI signed', dealId: 'deal-newco', timestamp: '4h ago' },
  { id: '3', type: 'document', description: 'Seller uploaded P&L – TechStartup Inc', dealId: 'deal-1', timestamp: '5h ago' },
  { id: '4', type: 'invite', description: 'Partner invite accepted – GreenVentures', timestamp: '8h ago' },
  { id: '5', type: 'document', description: 'CIM approved – HealthTech Solutions', dealId: 'deal-3', timestamp: '1d ago' },
  { id: '6', type: 'status', description: 'Deal moved to Due Diligence – DataFlow', dealId: 'deal-4', timestamp: '1d ago' },
];

const activityIcons = {
  note: MessageSquare,
  document: FileText,
  status: CheckCircle,
  invite: UserPlus,
};

const activityColors = {
  note: 'bg-blue-100 text-blue-600',
  document: 'bg-emerald-100 text-emerald-600',
  status: 'bg-purple-100 text-purple-600',
  invite: 'bg-amber-100 text-amber-600',
};

export const RecentActivityWidget = () => {
  const navigate = useNavigate();

  const handleClick = (activity: ActivityItem) => {
    if (activity.dealId) {
      navigate(`/deals/${activity.dealId}`);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Latest updates across deals</p>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-border">
        {mockActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              onClick={() => handleClick(activity)}
              className={cn(
                "px-5 py-3.5 flex items-start gap-3 transition-colors",
                activity.dealId && "hover:bg-muted/50 cursor-pointer group"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                activityColors[activity.type]
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm text-foreground",
                  activity.dealId && "group-hover:text-[#D4AF37] transition-colors"
                )}>
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.timestamp}
                </p>
              </div>
              {activity.dealId && (
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
