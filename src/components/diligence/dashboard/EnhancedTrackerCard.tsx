import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ChevronRight, 
  Users,
  MoreVertical,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Eye,
  Download,
  Copy,
  Calendar,
  Archive,
  Trash2,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface CategoryProgress {
  name: string;
  completed: number;
  total: number;
  overdue: number;
}

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role?: string;
  isOnline?: boolean;
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
    team?: TeamMember[];
    overdueCount?: number;
    stage?: 'early' | 'due_diligence' | 'final_review' | 'closed';
  };
  onTeamMemberClick?: (memberId: string) => void;
}

const EnhancedTrackerCard: React.FC<EnhancedTrackerCardProps> = ({ deal, onTeamMemberClick }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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
    if (cat.overdue > 0) return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' };
    if (cat.completed === cat.total) return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' };
    if (cat.completed > 0) return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' };
    return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50' };
  };

  const stageInfo = getStageInfo(deal.stage || (deal.progress_percentage < 25 ? 'early' : deal.progress_percentage < 75 ? 'due_diligence' : 'final_review'));
  
  // Mock categories if not provided
  const categories: CategoryProgress[] = deal.categories || [
    { name: 'Financial', completed: Math.floor(deal.completed_requests * 0.4), total: Math.floor(deal.total_requests * 0.4), overdue: 0 },
    { name: 'Legal', completed: Math.floor(deal.completed_requests * 0.3), total: Math.floor(deal.total_requests * 0.3), overdue: 0 },
    { name: 'Operations', completed: Math.floor(deal.completed_requests * 0.3), total: Math.floor(deal.total_requests * 0.3), overdue: 0 },
  ].filter(c => c.total > 0);

  // Find category with lowest completion
  const lowestCategory = categories.reduce((lowest, cat) => {
    const catProgress = cat.total > 0 ? cat.completed / cat.total : 1;
    const lowestProgress = lowest.total > 0 ? lowest.completed / lowest.total : 1;
    return catProgress < lowestProgress ? cat : lowest;
  }, categories[0]);

  // Mock team if not provided
  const team: TeamMember[] = deal.team || [
    { id: '1', name: 'Sarah Adams', initials: 'SA', role: 'Lead Analyst', isOnline: true },
    { id: '2', name: 'Mike Kim', initials: 'MK', role: 'Associate', isOnline: false },
    { id: '3', name: 'Hannah Jones', initials: 'HJ', role: 'Junior Analyst', isOnline: true },
  ];

  const toggleCategory = (categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <TooltipProvider>
      <div 
        className={`bg-white rounded-xl border border-gray-200 transition-all duration-300 cursor-pointer group relative overflow-hidden
          ${isHovered ? 'shadow-lg -translate-y-1 border-blue-300' : 'hover:border-blue-200 hover:shadow-md'}`}
        onClick={() => navigate(`/dashboard/diligence-tracker/${deal.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Quick Action Buttons - Show on hover */}
        <div className={`absolute top-2 right-2 z-10 flex items-center gap-1 transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 bg-white shadow-sm border border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/diligence-tracker/${deal.id}`); }}
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Tracker</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 bg-white shadow-sm border border-gray-200 hover:bg-green-50 hover:border-green-300"
                onClick={(e) => { e.stopPropagation(); /* Add request action */ }}
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Request</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 bg-white shadow-sm border border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                onClick={(e) => { e.stopPropagation(); /* Export action */ }}
              >
                <Download className="w-4 h-4 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Report</TooltipContent>
          </Tooltip>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 bg-white shadow-sm border border-gray-200 hover:bg-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Users className="w-4 h-4 mr-2" /> Assign Team Member
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" /> Change Stage
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Calendar className="w-4 h-4 mr-2" /> Set Target Date
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="w-4 h-4 mr-2" /> Duplicate Tracker
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Archive className="w-4 h-4 mr-2" /> Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
            
            <Badge variant="outline" className={`${stageInfo.className} ${isHovered ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
              {stageInfo.label}
            </Badge>
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
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(deal.progress_percentage)}`}
                style={{ width: `${deal.progress_percentage}%` }}
              />
            </div>
          </div>
          
          {/* Category Breakdown - Interactive */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
              By Category
              <TrendingUp className="w-3 h-3" />
            </p>
            <div className="space-y-1.5">
              {categories.slice(0, 3).map((cat) => {
                const status = getCategoryStatus(cat);
                const StatusIcon = status.icon;
                const catProgress = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
                const isExpanded = expandedCategory === cat.name;
                const isLowest = cat === lowestCategory && catProgress < 100 && catProgress > 0;
                
                return (
                  <div key={cat.name}>
                    <button 
                      className={`w-full flex items-center gap-2 p-1.5 -mx-1.5 rounded-lg transition-colors hover:bg-gray-50 ${isLowest ? 'ring-1 ring-amber-200 bg-amber-50/50' : ''}`}
                      onClick={(e) => toggleCategory(cat.name, e)}
                    >
                      <span className="text-sm text-gray-600 w-20 truncate text-left">{cat.name}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${cat.overdue > 0 ? 'bg-red-400' : catProgress === 100 ? 'bg-green-400' : 'bg-blue-400'}`}
                          style={{ width: `${catProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{catProgress}%</span>
                      <div className={`p-1 rounded ${status.bg}`}>
                        <StatusIcon className={`w-3 h-3 ${status.color}`} />
                      </div>
                      {cat.overdue > 0 && (
                        <Badge variant="destructive" className="text-xs py-0 px-1.5 h-4">
                          {cat.overdue}
                        </Badge>
                      )}
                      {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                    </button>
                    
                    {/* Expanded subcategory view */}
                    {isExpanded && (
                      <div className="ml-6 mt-2 p-3 bg-gray-50 rounded-lg space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Subcategory breakdown</span>
                          <span className="text-blue-600 hover:underline cursor-pointer">View all →</span>
                        </div>
                        {/* Mock subcategories */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Tax Returns</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full" style={{ width: '100%' }} />
                              </div>
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Financial Statements</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: '50%' }} />
                              </div>
                              <Clock className="w-3 h-3 text-amber-500" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Bank Statements</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-300 rounded-full" style={{ width: '0%' }} />
                              </div>
                              <Clock className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Footer - Team Avatars with Tooltips */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {team.slice(0, 3).map((member, index) => (
                  <Tooltip key={member.id}>
                    <TooltipTrigger asChild>
                      <button
                        className="relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTeamMemberClick?.(member.id);
                        }}
                      >
                        <Avatar className={`w-7 h-7 border-2 border-white ring-0 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer ${index === 0 ? 'z-30' : index === 1 ? 'z-20' : 'z-10'}`}>
                          <AvatarFallback className={`text-xs ${
                            index === 0 ? 'bg-blue-100 text-blue-700' :
                            index === 1 ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        {member.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-gray-900 text-white">
                      <div className="text-center">
                        <p className="font-medium">{member.name}</p>
                        {member.role && <p className="text-xs text-gray-300">{member.role}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{member.isOnline ? '🟢 Online' : '⚪ Offline'}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {team.length > 3 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors z-0">
                        <span className="text-xs text-gray-600 font-medium">+{team.length - 3}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-gray-900 text-white">
                      <p>{team.slice(3).map(m => m.name).join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tracker?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the diligence tracker for <strong>{deal.company_name}</strong> and all associated requests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default EnhancedTrackerCard;