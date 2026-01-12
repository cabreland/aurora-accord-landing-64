import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertCircle, 
  Clock, 
  User, 
  CheckCircle2,
  Gauge,
  Users,
  FileX,
  Timer
} from 'lucide-react';
import { DealHealth } from '@/hooks/useMissionControl';
import { cn } from '@/lib/utils';

interface PriorityActionsSectionProps {
  dealsRequiringAction: DealHealth[];
  loading: boolean;
}

interface PriorityAction {
  id: string;
  companyName: string;
  companyInitials: string;
  dealId: string;
  type: 'overdue' | 'pending' | 'missing' | 'stalled';
  description: string;
  daysWaiting: number;
  assignee: string;
}

// Mock team data - replace with real data
const mockTeamMembers = [
  { id: '1', name: 'Sarah Chen', initials: 'SC', performance: 92 },
  { id: '2', name: 'Mike Johnson', initials: 'MJ', performance: 78 },
  { id: '3', name: 'Emily Davis', initials: 'ED', performance: 85 },
];

export const PriorityActionsSection: React.FC<PriorityActionsSectionProps> = ({
  dealsRequiringAction,
  loading
}) => {
  const navigate = useNavigate();

  // Transform deals into priority actions
  const priorityActions: PriorityAction[] = dealsRequiringAction.flatMap(deal => 
    deal.urgent_items.map(item => ({
      id: `${deal.id}-${item.type}`,
      companyName: deal.company_name || deal.title,
      companyInitials: (deal.company_name || deal.title).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      dealId: deal.id,
      type: item.type,
      description: item.label,
      daysWaiting: item.days || deal.days_in_stage,
      assignee: 'Unassigned'
    }))
  ).slice(0, 6);

  // Mock velocity metrics - replace with real data
  const avgDaysToClose = 45;
  const conversionRate = 68;

  const getTypeBadge = (type: PriorityAction['type']) => {
    switch (type) {
      case 'overdue':
        return <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
      case 'missing':
        return <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Missing Docs</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Pending 48h+</Badge>;
      case 'stalled':
        return <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200">Stalled</Badge>;
    }
  };

  const getTypeIcon = (type: PriorityAction['type']) => {
    switch (type) {
      case 'overdue':
        return <Clock className="w-4 h-4 text-red-500" />;
      case 'missing':
        return <FileX className="w-4 h-4 text-orange-500" />;
      case 'pending':
        return <Timer className="w-4 h-4 text-yellow-600" />;
      case 'stalled':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-16 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Priority Actions - 2/3 width */}
      <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Priority Actions
              {priorityActions.length > 0 && (
                <Badge className="bg-red-100 text-red-700 font-semibold ml-1">
                  {priorityActions.length}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Items requiring immediate attention</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/diligence-tracker')}
            className="text-gray-600 hover:text-gray-900"
          >
            View All →
          </Button>
        </div>

        {/* Action List */}
        <div className="divide-y divide-gray-100">
          {priorityActions.length > 0 ? (
            priorityActions.map((action) => (
              <div 
                key={action.id}
                className="px-6 py-4 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/deal/${action.dealId}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Company Icon */}
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    {action.companyInitials}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.companyName}
                      </p>
                      {getTypeBadge(action.type)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      {getTypeIcon(action.type)}
                      {action.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {action.daysWaiting} days waiting
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {action.assignee}
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick Action */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/deal/${action.dealId}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 mb-1">All caught up!</p>
              <p className="text-sm text-gray-500">No urgent items requiring attention</p>
            </div>
          )}
        </div>
      </Card>

      {/* Right Sidebar - Quick Stats */}
      <div className="space-y-6">
        {/* Pipeline Velocity */}
        <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-500" />
            Pipeline Velocity
          </h4>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600">Avg Days to Close</span>
                <span className="font-bold text-gray-900">{avgDaysToClose}d</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" 
                    style={{ width: '60%' }} 
                  />
                </div>
                <span className="text-xs text-green-600 font-semibold">-12%</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600">Deal Conversion Rate</span>
                <span className="font-bold text-gray-900">{conversionRate}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500" 
                    style={{ width: `${conversionRate}%` }} 
                  />
                </div>
                <span className="text-xs text-green-600 font-semibold">+8%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Team Performance */}
        <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            Team Performance
          </h4>
          
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8 border-2 border-gray-100">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-semibold">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{member.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          member.performance >= 80 
                            ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                            : member.performance >= 60 
                              ? "bg-gradient-to-r from-blue-500 to-purple-400"
                              : "bg-gradient-to-r from-yellow-500 to-orange-400"
                        )}
                        style={{ width: `${member.performance}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{member.performance}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PriorityActionsSection;
