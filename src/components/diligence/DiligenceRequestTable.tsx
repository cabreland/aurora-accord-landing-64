import React from 'react';
import { format, isPast, isToday, addDays } from 'date-fns';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User,
  FileText,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DiligenceRequest, DiligenceCategory, DiligenceSubcategory } from '@/hooks/useDiligenceTracker';
import { useTeamMembers, getTeamMemberInitials, getTeamMemberName } from '@/hooks/useTeamMembers';

// Color palette for user avatars based on user ID
const avatarColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
];

const getAvatarColor = (userId: string) => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

interface DiligenceRequestTableProps {
  requests: DiligenceRequest[];
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  onSelectRequest: (request: DiligenceRequest) => void;
  isLoading: boolean;
}

const statusConfig = {
  open: { label: 'Open', color: 'text-red-600', bg: 'bg-red-50 border-red-200', dotColor: 'bg-red-500' },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', dotColor: 'bg-amber-500' },
  completed: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50 border-green-200', dotColor: 'bg-green-500' },
  blocked: { label: 'Blocked', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300', dotColor: 'bg-gray-500' },
};

const priorityConfig = {
  high: { label: 'High', color: 'text-red-600', bg: 'bg-red-50' },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50' },
  low: { label: 'Low', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const DiligenceRequestTable: React.FC<DiligenceRequestTableProps> = ({
  requests,
  categories,
  subcategories,
  onSelectRequest,
  isLoading
}) => {
  const { data: teamMembers = [] } = useTeamMembers();
  
  const getAssignee = (assigneeId: string | null) => {
    if (!assigneeId) return null;
    return teamMembers.find(m => m.user_id === assigneeId) || null;
  };
  
  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      super_admin: 'Super Administrator',
      admin: 'Administrator',
      editor: 'Editor',
      viewer: 'Viewer',
      investor: 'Investor',
    };
    return roleNames[role] || role;
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
    <TooltipProvider>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
              <TableHead className="w-[40px] py-3">
                <Checkbox className="border-gray-300" />
              </TableHead>
              <TableHead className="text-gray-600 font-medium py-3 w-[50px]">Status</TableHead>
              <TableHead className="text-gray-600 font-medium py-3">Request Name</TableHead>
              <TableHead className="text-gray-600 font-medium py-3 w-[130px]">Assigned To</TableHead>
              <TableHead className="text-gray-600 font-medium py-3 w-[100px]">Due Date</TableHead>
              <TableHead className="text-gray-600 font-medium py-3 w-[60px] text-center">Docs</TableHead>
              <TableHead className="text-gray-600 font-medium py-3 w-[60px] text-center">Chat</TableHead>
              <TableHead className="text-gray-600 font-medium py-3 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const status = statusConfig[request.status];
              const priority = priorityConfig[request.priority];
              const dueDateStatus = getDueDateStatus(request.due_date, request.status);
              const categoryName = getCategoryName(request.category_id);
              const subcategoryName = getSubcategoryName(request.subcategory_id);
              const documentCount = request.document_ids?.length || 0;
              const assignee = getAssignee(request.assignee_id);
              const avatarColor = request.assignee_id ? getAvatarColor(request.assignee_id) : null;
              
              return (
                <TableRow 
                  key={request.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectRequest(request)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-3">
                    <Checkbox 
                      checked={request.status === 'completed'}
                      className="border-gray-300" 
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className={`w-3 h-3 rounded-full ${status.dotColor}`} title={status.label} />
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <div className="font-medium text-gray-900">{request.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {categoryName}
                        {subcategoryName && ` › ${subcategoryName}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {assignee ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                              {assignee.profile_picture_url ? (
                                <AvatarImage src={assignee.profile_picture_url} alt={getTeamMemberName(assignee)} />
                              ) : null}
                              <AvatarFallback className={`${avatarColor?.bg} ${avatarColor?.text} text-xs font-medium`}>
                                {getTeamMemberInitials(assignee)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-700 truncate max-w-[80px]">
                              {getTeamMemberName(assignee)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-white text-xs">
                          <p className="font-medium">{getTeamMemberName(assignee)}</p>
                          <p className="text-gray-400">{getRoleDisplayName(assignee.role)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-400">—</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-white text-xs">
                          Unassigned
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
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
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">{documentCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">0</span>
                    </div>
                  </TableCell>
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
    </TooltipProvider>
  );
};

export default DiligenceRequestTable;
