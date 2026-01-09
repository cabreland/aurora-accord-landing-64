import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ChevronRight, 
  Users,
  MoreVertical,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface CategoryProgress {
  name: string;
  completed: number;
  total: number;
  overdue: number;
}

interface EnhancedTrackerCardProps {
  deal: {
    id: string;
    company_name: string;
    title: string;
    industry?: string;
    total_requests: number;
    completed_requests: number;
    progress_percentage: number;
    updated_at?: string;
    categories?: CategoryProgress[];
    team?: Array<{ id: string; name: string; initials: string }>;
    overdueCount?: number;
    stage?: 'early' | 'due_diligence' | 'final_review' | 'closed';
  };
}

const EnhancedTrackerCard: React.FC<EnhancedTrackerCardProps> = ({ deal }) => {
  const navigate = useNavigate();
  
  const getStageInfo = (stage?: string) => {
    switch (stage) {
      case 'early':
        return { label: 'Early Stage', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'due_diligence':
        return { label: 'Due Diligence', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'final_review':
        return { label: 'Final Review', className: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'closed':
        return { label: 'Closed', className: 'bg-green-50 text-green-700 border-green-200' };
      default:
        return { label: 'In Progress', className: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-gray-300';
  };

  const getCategoryStatus = (cat: CategoryProgress) => {
    if (cat.overdue > 0) return { icon: AlertTriangle, color: 'text-red-500' };
    if (cat.completed === cat.total) return { icon: CheckCircle2, color: 'text-green-500' };
    if (cat.completed > 0) return { icon: Clock, color: 'text-amber-500' };
    return { icon: Clock, color: 'text-gray-400' };
  };

  const stageInfo = getStageInfo(deal.stage || (deal.progress_percentage < 25 ? 'early' : deal.progress_percentage < 75 ? 'due_diligence' : 'final_review'));
  
  // Mock categories if not provided
  const categories: CategoryProgress[] = deal.categories || [
    { name: 'Financial', completed: Math.floor(deal.completed_requests * 0.4), total: Math.floor(deal.total_requests * 0.4), overdue: 0 },
    { name: 'Legal', completed: Math.floor(deal.completed_requests * 0.3), total: Math.floor(deal.total_requests * 0.3), overdue: 0 },
    { name: 'Operations', completed: Math.floor(deal.completed_requests * 0.3), total: Math.floor(deal.total_requests * 0.3), overdue: 0 },
  ].filter(c => c.total > 0);

  // Mock team if not provided
  const team = deal.team || [
    { id: '1', name: 'Sarah A', initials: 'SA' },
    { id: '2', name: 'Mike K', initials: 'MK' },
  ];

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/dashboard/diligence-tracker/${deal.id}`)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {deal.company_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{deal.industry || 'Technology'}</span>
                <span>•</span>
                <span>{deal.title}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Badge variant="outline" className={stageInfo.className}>
              {stageInfo.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200">
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" /> Assign Team
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" /> Export Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Archive Tracker
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-gray-600">
              {deal.completed_requests}/{deal.total_requests} Complete
            </span>
            <span className="text-sm font-semibold text-gray-900">{deal.progress_percentage}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${getProgressColor(deal.progress_percentage)}`}
              style={{ width: `${deal.progress_percentage}%` }}
            />
          </div>
        </div>
        
        {/* Category Breakdown */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">By Category</p>
          <div className="space-y-1.5">
            {categories.slice(0, 3).map((cat) => {
              const status = getCategoryStatus(cat);
              const StatusIcon = status.icon;
              const catProgress = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
              
              return (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-20 truncate">{cat.name}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${cat.overdue > 0 ? 'bg-red-400' : catProgress === 100 ? 'bg-green-400' : 'bg-blue-400'}`}
                      style={{ width: `${catProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{catProgress}%</span>
                  <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                  {cat.overdue > 0 && (
                    <Badge variant="destructive" className="text-xs py-0 px-1.5 h-4">
                      {cat.overdue}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {team.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="w-7 h-7 border-2 border-white">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{team.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {deal.updated_at ? `Updated ${formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true })}` : 'Recently updated'}
            </span>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default EnhancedTrackerCard;
