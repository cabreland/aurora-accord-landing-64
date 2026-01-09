import React from 'react';
import { format, isPast, isToday, addDays, differenceInHours } from 'date-fns';
import { 
  AlertTriangle,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Sparkles,
  Check,
  Clock,
  Circle,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DiligenceRequest, DiligenceCategory, DiligenceSubcategory } from '@/hooks/useDiligenceTracker';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useDiligenceRequestCounts } from '@/hooks/useDiligenceRequestCounts';
import { useRequestViews, hasUnreadUpdates } from '@/hooks/useRequestViews';
import StackedAvatars, { AssigneeInfo } from '@/components/common/StackedAvatars';

interface DiligenceRequestTableProps {
  requests: DiligenceRequest[];
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  onSelectRequest: (request: DiligenceRequest) => void;
  isLoading: boolean;
  dealId?: string;
}

// Status badge configuration with icons and proper colors
// Open = Blue, In Progress = Amber/Yellow, Resolved = Green, Blocked = Red
const statusConfig = {
  open: { 
    label: 'Open', 
    icon: Circle,
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'
  },
  in_progress: { 
    label: 'In Progress', 
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100'
  },
  completed: { 
    label: 'Resolved', 
    icon: Check,
    className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
  },
  blocked: { 
    label: 'Blocked', 
    icon: AlertCircle,
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100'
  },
};

const priorityConfig = {
  high: { label: 'High', color: 'text-red-700', bg: 'bg-red-100' },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100' },
  low: { label: 'Low', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const DiligenceRequestTable: React.FC<DiligenceRequestTableProps> = ({
  requests,
  categories,
  subcategories,
  onSelectRequest,
  isLoading,
  dealId
}) => {
  const [selectedRequests, setSelectedRequests] = React.useState<string[]>([]);
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: requestCounts = {} } = useDiligenceRequestCounts(dealId);
  const { data: viewMap = {} } = useRequestViews(dealId);
  
  // Toggle selection for bulk actions
  const toggleSelection = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map(r => r.id));
    }
  };

  // Check if "NEW" badge should show
  // Shows when: created < 24 hours ago AND no assignee AND no comments AND status is open
  const shouldShowNewBadge = (request: DiligenceRequest, commentCount: number): boolean => {
    const createdAt = new Date(request.created_at);
    const hoursSinceCreation = differenceInHours(new Date(), createdAt);
    const isRecent = hoursSinceCreation < 24;
    
    const hasAssignee = (request.assignee_ids?.length > 0) || !!request.assignee_id;
    const hasComments = commentCount > 0;
    const isStillOpen = request.status === 'open';
    
    return isRecent && !hasAssignee && !hasComments && isStillOpen;
  };
  
  // Get assignees for a request (supports both single and multiple)
  const getAssignees = (request: DiligenceRequest): AssigneeInfo[] => {
    const assigneeIds = request.assignee_ids?.length > 0 
      ? request.assignee_ids 
      : request.assignee_id 
        ? [request.assignee_id] 
        : [];
    
    return assigneeIds
      .map(id => teamMembers.find(m => m.user_id === id))
      .filter((m): m is (typeof teamMembers)[number] => m !== undefined)
      .map(m => ({
        user_id: m.user_id,
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.email,
        profile_picture_url: m.profile_picture_url,
        role: m.role,
      }));
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };
  
  const getSubcategoryName = (subcategoryId: string | null) => {
    if (!subcategoryId) return '';
    return subcategories.find(s => s.id === subcategoryId)?.name || '';
  };
  
  const getDueDateStatus = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed') return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    
    if (isPast(date) && !isToday(date)) {
      return 'overdue';
    }
    
    if (date <= addDays(now, 3)) {
      return 'due-soon';
    }
    
    return 'normal';
  };

  // Sort requests: non-resolved first, then resolved at bottom
  const sortedRequests = React.useMemo(() => {
    return [...requests].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    });
  }, [requests]);
  
  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading requests...
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
        <p className="text-gray-500">Add a request or apply a template to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
            <TableHead className="w-[40px] py-3">
              <Checkbox 
                checked={selectedRequests.length === requests.length && requests.length > 0}
                onCheckedChange={toggleAllSelection}
                className="border-gray-300" 
              />
            </TableHead>
            <TableHead className="text-gray-600 font-medium py-3">Request Name</TableHead>
            <TableHead className="text-gray-600 font-medium py-3 w-[120px]">Status</TableHead>
            <TableHead className="text-gray-600 font-medium py-3 w-[150px]">Assigned To</TableHead>
            <TableHead className="text-gray-600 font-medium py-3 w-[100px]">Due Date</TableHead>
            <TableHead className="text-gray-600 font-medium py-3 w-[60px] text-center">Docs</TableHead>
            <TableHead className="text-gray-600 font-medium py-3 w-[60px] text-center">Chat</TableHead>
            <TableHead className="text-gray-600 font-medium py-3 w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRequests.map((request) => {
            const status = statusConfig[request.status];
            const StatusIcon = status.icon;
            const dueDateStatus = getDueDateStatus(request.due_date, request.status);
            const categoryName = getCategoryName(request.category_id);
            const subcategoryName = getSubcategoryName(request.subcategory_id);
            const counts = requestCounts[request.id] || { documentCount: 0, commentCount: 0 };
            const assignees = getAssignees(request);
            const isUnread = hasUnreadUpdates(request.id, request.last_activity_at, viewMap);
            const showNewBadge = shouldShowNewBadge(request, counts.commentCount);
            const isResolved = request.status === 'completed';
            
            return (
              <TableRow 
                key={request.id}
                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isResolved ? 'bg-green-50/30' : isUnread ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => onSelectRequest(request)}
              >
                {/* Clean checkbox - selection only, no status connection */}
                <TableCell onClick={(e) => e.stopPropagation()} className="py-3">
                  <Checkbox 
                    checked={selectedRequests.includes(request.id)}
                    onCheckedChange={() => toggleSelection(request.id)}
                    className="border-gray-300" 
                  />
                </TableCell>

                {/* Request Name with optional NEW badge */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className={`font-medium flex items-center gap-2 ${
                        isResolved ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {request.title}
                        {showNewBadge && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0 font-medium">
                            <Sparkles className="w-3 h-3 mr-0.5" />
                            NEW
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {categoryName}
                        {subcategoryName && ` › ${subcategoryName}`}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Status Badge - Clear and self-explanatory */}
                <TableCell className="py-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ${status.className}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </TableCell>

                {/* Assigned To */}
                <TableCell className="py-3">
                  <StackedAvatars
                    assignees={assignees}
                    maxVisible={3}
                    size="sm"
                    showTooltip
                  />
                </TableCell>

                {/* Due Date */}
                <TableCell className="py-3">
                  {request.due_date ? (
                    <span className={`text-sm font-medium ${
                      dueDateStatus === 'overdue' 
                        ? 'text-red-600' 
                        : dueDateStatus === 'due-soon' 
                          ? 'text-amber-600' 
                          : 'text-gray-700'
                    }`}>
                      {format(new Date(request.due_date), 'MMM d')}
                      {dueDateStatus === 'overdue' && (
                        <AlertTriangle className="w-3 h-3 inline ml-1" />
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </TableCell>

                {/* Docs Count */}
                <TableCell className="py-3 text-center">
                  <div className={`flex items-center justify-center gap-1 ${counts.documentCount > 0 ? 'text-primary' : 'text-gray-400'}`}>
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium">{counts.documentCount}</span>
                  </div>
                </TableCell>

                {/* Chat Count */}
                <TableCell className="py-3 text-center">
                  <div className={`flex items-center justify-center gap-1 ${counts.commentCount > 0 ? 'text-primary' : 'text-gray-400'}`}>
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-medium">{counts.commentCount}</span>
                  </div>
                </TableCell>

                {/* Actions Menu */}
                <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-gray-200">
                      <DropdownMenuItem onClick={() => onSelectRequest(request)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DiligenceRequestTable;
