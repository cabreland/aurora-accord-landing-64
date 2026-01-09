import React from 'react';
import { format, isPast, isToday, addDays } from 'date-fns';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DiligenceRequest, DiligenceCategory, DiligenceSubcategory } from '@/hooks/useDiligenceTracker';

interface DiligenceRequestTableProps {
  requests: DiligenceRequest[];
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  onSelectRequest: (request: DiligenceRequest) => void;
  isLoading: boolean;
}

const priorityConfig = {
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10', icon: '🔴' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: '🟡' },
  low: { label: 'Low', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: '⚪' },
};

const statusConfig = {
  open: { label: 'Open', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Circle },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
};

const DiligenceRequestTable: React.FC<DiligenceRequestTableProps> = ({
  requests,
  categories,
  subcategories,
  onSelectRequest,
  isLoading
}) => {
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
      <div className="text-center py-12 text-gray-400">
        Loading requests...
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1A1F2E] rounded-lg border border-[#2A2F3A]">
        <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No requests found</h3>
        <p className="text-gray-400">Add a request or apply a template to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#2A2F3A] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#1A1F2E] border-b border-[#2A2F3A] hover:bg-[#1A1F2E]">
            <TableHead className="w-[40px]">
              <Checkbox className="border-[#2A2F3A]" />
            </TableHead>
            <TableHead className="text-gray-400">Request Title</TableHead>
            <TableHead className="text-gray-400 w-[100px]">Priority</TableHead>
            <TableHead className="text-gray-400 w-[120px]">Status</TableHead>
            <TableHead className="text-gray-400 w-[100px]">Assignee</TableHead>
            <TableHead className="text-gray-400 w-[120px]">Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const priority = priorityConfig[request.priority];
            const status = statusConfig[request.status];
            const StatusIcon = status.icon;
            const dueDateStatus = getDueDateStatus(request.due_date, request.status);
            const categoryName = getCategoryName(request.category_id);
            const subcategoryName = getSubcategoryName(request.subcategory_id);
            
            return (
              <TableRow 
                key={request.id}
                className="bg-[#0A0F0F] border-b border-[#2A2F3A] hover:bg-[#1A1F2E] cursor-pointer"
                onClick={() => onSelectRequest(request)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={request.status === 'completed'}
                    className="border-[#2A2F3A]" 
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      {categoryName}
                      {subcategoryName && ` / ${subcategoryName}`}
                    </div>
                    <div className="text-white font-medium">{request.title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-sm ${priority.color}`}>
                    {priority.icon} {priority.label}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${status.bg} ${status.color} border-0`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {request.assignee_id ? (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <span className="text-gray-500 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {request.due_date ? (
                    <span className={`text-sm ${
                      dueDateStatus === 'overdue' 
                        ? 'text-red-400' 
                        : dueDateStatus === 'due-soon' 
                          ? 'text-yellow-400' 
                          : 'text-gray-400'
                    }`}>
                      {format(new Date(request.due_date), 'MMM d')}
                      {dueDateStatus === 'overdue' && (
                        <AlertTriangle className="w-3 h-3 inline ml-1" />
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">—</span>
                  )}
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
