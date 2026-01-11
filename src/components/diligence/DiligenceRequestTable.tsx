import React from 'react';
import { format, isPast, isToday, addDays, differenceInHours, isThisYear } from 'date-fns';
import { 
  AlertTriangle,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Sparkles,
  Check,
  Clock,
  Circle,
  AlertCircle,
  Plus,
  Send,
  Paperclip,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Flag,
  Search,
  Tag
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DiligenceRequest, DiligenceCategory, DiligenceSubcategory, useUpdateDiligenceRequest, useDeleteDiligenceRequest } from '@/hooks/useDiligenceTracker';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useDiligenceRequestCounts } from '@/hooks/useDiligenceRequestCounts';
import { useRequestViews, hasUnreadUpdates } from '@/hooks/useRequestViews';
import { useAuth } from '@/hooks/useAuth';
import BulkActionsToolbar from './BulkActionsToolbar';
import PriorityFlagCell from './PriorityFlagCell';
import ReviewersCell from './ReviewersCell';
import LastUpdatedCell from './LastUpdatedCell';
import CategoryHeaderRow from './CategoryHeaderRow';
import ColumnVisibilityDropdown, { useColumnVisibility, ColumnConfig } from './ColumnVisibilityDropdown';
import { toast } from 'sonner';

interface DiligenceRequestTableProps {
  requests: DiligenceRequest[];
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  onSelectRequest: (request: DiligenceRequest) => void;
  isLoading: boolean;
  dealId?: string;
  onAddRequest?: () => void;
}

// Status badge configuration - Open, In Progress, Resolved
const statusConfig: Record<string, { label: string; icon: React.ComponentType<any>; className: string; description: string }> = {
  open: { 
    label: 'Open', 
    icon: Circle,
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
    description: 'Awaiting action'
  },
  in_progress: { 
    label: 'In Progress', 
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
    description: 'Work in progress'
  },
  completed: { 
    label: 'Resolved', 
    icon: Check,
    className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
    description: 'Item resolved'
  },
  blocked: { 
    label: 'Blocked', 
    icon: AlertCircle,
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
    description: 'Blocked by dependency'
  },
};

// Sort config
type SortField = 'title' | 'status' | 'priority' | 'due_date' | 'last_activity_at';
type SortDirection = 'asc' | 'desc';

// Column order: Title, PR, Status, Assignee, Reviewer, Findings, Reply, Files, Labels, Start date, Due date, Updated
const defaultColumns: ColumnConfig[] = [
  { id: 'title', label: 'Title', visible: true, required: true },
  { id: 'priority', label: 'PR', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'assignee', label: 'Assignee', visible: true },
  { id: 'reviewers', label: 'Reviewers', visible: true },
  { id: 'findings', label: 'Findings', visible: true },
  { id: 'comments', label: 'Reply', visible: true },
  { id: 'docs', label: 'Files', visible: true },
  { id: 'labels', label: 'Labels', visible: false },
  { id: 'start_date', label: 'Start date', visible: true },
  { id: 'due_date', label: 'Due date', visible: true },
  { id: 'updated', label: 'Updated', visible: true },
];

// Shared cell classes for column dividers
const cellDivider = "border-r border-border/40";

// Column width definitions for consistent alignment
const columnWidths = {
  checkbox: "w-12 px-3",
  title: "min-w-[280px] px-4",
  priority: "w-16 px-3",
  status: "w-32 px-4",
  assignee: "w-40 px-4",
  reviewers: "w-36 px-4",
  findings: "w-16 px-3",
  comments: "w-16 px-3",
  docs: "w-16 px-3",
  labels: "w-20 px-3",
  startDate: "w-28 px-4",
  dueDate: "w-28 px-4",
  updated: "w-28 px-4",
  actions: "w-12 px-3"
};

const DiligenceRequestTable: React.FC<DiligenceRequestTableProps> = ({
  requests,
  categories,
  subcategories,
  onSelectRequest,
  isLoading,
  dealId,
  onAddRequest
}) => {
  const [selectedRequests, setSelectedRequests] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [sortField, setSortField] = React.useState<SortField>('last_activity_at');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  
  const { user } = useAuth();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: requestCounts = {} } = useDiligenceRequestCounts(dealId);
  const { data: viewMap = {} } = useRequestViews(dealId);
  const { columns, toggleColumn, isVisible } = useColumnVisibility('diligence-table-columns', defaultColumns);
  
  const updateRequest = useUpdateDiligenceRequest();
  const deleteRequest = useDeleteDiligenceRequest();
  
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
  
  // Clear selection
  const clearSelection = () => setSelectedRequests([]);
  
  // Select all
  const selectAll = () => setSelectedRequests(requests.map(r => r.id));
  
  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };
  
  // Bulk action handlers
  const handleBulkMarkResolved = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedRequests.map(id => 
          updateRequest.mutateAsync({ id, status: 'completed' })
        )
      );
      toast.success(`${selectedRequests.length} requests marked as resolved`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to update some requests');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBulkMarkInProgress = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedRequests.map(id => 
          updateRequest.mutateAsync({ id, status: 'in_progress' })
        )
      );
      toast.success(`${selectedRequests.length} requests marked as in progress`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to update some requests');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBulkAssign = async (userId: string) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedRequests.map(id => 
          updateRequest.mutateAsync({ id, assignee_ids: [userId] })
        )
      );
      const member = teamMembers.find(m => m.user_id === userId);
      toast.success(`${selectedRequests.length} requests assigned to ${member?.first_name || 'user'}`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to assign some requests');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBulkSendToCustomer = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedRequests.map(id => 
          updateRequest.mutateAsync({ id, status: 'in_progress' })
        )
      );
      toast.success(`${selectedRequests.length} requests marked as sent to customer`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to send some requests');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedRequests.length} requests? This cannot be undone.`)) return;
    
    setIsProcessing(true);
    try {
      const requestsToDelete = requests.filter(r => selectedRequests.includes(r.id));
      await Promise.all(
        requestsToDelete.map(r => deleteRequest.mutateAsync({ id: r.id, dealId: r.deal_id }))
      );
      toast.success(`${selectedRequests.length} requests deleted`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to delete some requests');
    } finally {
      setIsProcessing(false);
    }
  };

  // Assign to me handler
  const handleAssignToMe = async (requestId: string, currentAssignees: string[]) => {
    if (!user?.id) return;
    const newAssignees = currentAssignees.includes(user.id) 
      ? currentAssignees 
      : [...currentAssignees, user.id];
    
    updateRequest.mutate({ id: requestId, assignee_ids: newAssignees });
    toast.success('Assigned to you');
  };

  // Check if "NEW" badge should show
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
  const getAssignees = (request: DiligenceRequest) => {
    const assigneeIds = request.assignee_ids?.length > 0 
      ? request.assignee_ids 
      : request.assignee_id 
        ? [request.assignee_id] 
        : [];
    
    return assigneeIds
      .map(id => teamMembers.find(m => m.user_id === id))
      .filter((m): m is (typeof teamMembers)[number] => m !== undefined);
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

  // Priority sort order
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  // Sort requests
  const sortedRequests = React.useMemo(() => {
    return [...requests].sort((a, b) => {
      // Always put completed at bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // Then apply user's sort
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'due_date':
          const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'last_activity_at':
          const aActivity = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
          const bActivity = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
          comparison = aActivity - bActivity;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [requests, sortField, sortDirection]);

  // Group sorted requests by category
  const groupedRequests = React.useMemo(() => {
    const groups = new Map<string, { category: DiligenceCategory; requests: DiligenceRequest[] }>();
    
    // First, sort categories by order_index or name
    const sortedCategories = [...categories].sort((a, b) => {
      if (a.order_index !== undefined && b.order_index !== undefined) {
        return a.order_index - b.order_index;
      }
      return a.name.localeCompare(b.name);
    });
    
    // Initialize groups in category order
    sortedCategories.forEach(cat => {
      groups.set(cat.id, { category: cat, requests: [] });
    });
    
    // Distribute requests into groups
    sortedRequests.forEach(request => {
      const group = groups.get(request.category_id);
      if (group) {
        group.requests.push(request);
      } else {
        // Handle case where category might not exist
        const unknownCat: DiligenceCategory = { 
          id: request.category_id, 
          name: 'Other', 
          created_at: '',
          icon: null,
          color: null,
          order_index: null
        };
        groups.set(request.category_id, { category: unknownCat, requests: [request] });
      }
    });
    
    // Filter out empty groups and convert to array
    return Array.from(groups.values()).filter(g => g.requests.length > 0);
  }, [sortedRequests, categories]);

  // Calculate column count for colspan
  const visibleColumnCount = React.useMemo(() => {
    let count = 2; // Checkbox + Actions are always visible
    count++; // Title is always visible
    if (isVisible('priority')) count++;
    if (isVisible('status')) count++;
    if (isVisible('assignee')) count++;
    if (isVisible('reviewers')) count++;
    if (isVisible('findings')) count++;
    if (isVisible('comments')) count++;
    if (isVisible('docs')) count++;
    if (isVisible('labels')) count++;
    if (isVisible('start_date')) count++;
    if (isVisible('due_date')) count++;
    if (isVisible('updated')) count++;
    return count;
  }, [isVisible]);
  
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading requests...
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
        <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
        <p className="text-muted-foreground mb-4">Add a request or apply a template to get started</p>
        {onAddRequest && (
          <Button 
            onClick={onAddRequest}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Request
          </Button>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border overflow-hidden bg-card">
        {/* Toolbar */}
        <div className="flex items-center justify-end px-3 py-2 border-b bg-muted/30">
          <ColumnVisibilityDropdown columns={columns} onToggleColumn={toggleColumn} />
        </div>
        
        {/* Full-width table without horizontal scroll */}
        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                {/* Checkbox */}
                <TableHead className={`${columnWidths.checkbox} py-3.5 text-center bg-gray-50 ${cellDivider}`}>
                  <Checkbox 
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                
                {/* Title */}
                <TableHead 
                  className={`${columnWidths.title} py-3.5 bg-gray-50 cursor-pointer hover:bg-gray-100 text-left ${cellDivider}`}
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                    {getSortIcon('title')}
                  </div>
                </TableHead>
                
                {/* Priority - PR text, not icon */}
                {isVisible('priority') && (
                  <TableHead 
                    className={`${columnWidths.priority} py-3.5 bg-gray-50 cursor-pointer hover:bg-gray-100 text-left ${cellDivider}`}
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      PR
                      {getSortIcon('priority')}
                    </div>
                  </TableHead>
                )}
                
                {/* Status */}
                {isVisible('status') && (
                  <TableHead 
                    className={`${columnWidths.status} py-3.5 bg-gray-50 cursor-pointer hover:bg-gray-100 text-left ${cellDivider}`}
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                )}
                
                {/* Assignee */}
                {isVisible('assignee') && (
                  <TableHead className={`${columnWidths.assignee} py-3.5 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${cellDivider}`}>
                    Assignee
                  </TableHead>
                )}
                
                {/* Reviewers */}
                {isVisible('reviewers') && (
                  <TableHead className={`${columnWidths.reviewers} py-3.5 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${cellDivider}`}>
                    Reviewers
                  </TableHead>
                )}
                
                {/* Findings - Icon header */}
                {isVisible('findings') && (
                  <TableHead className={`${columnWidths.findings} py-3.5 text-center bg-gray-50 ${cellDivider}`}>
                    <Search className="w-4 h-4 mx-auto text-gray-400" />
                  </TableHead>
                )}
                
                {/* Reply - Icon header */}
                {isVisible('comments') && (
                  <TableHead className={`${columnWidths.comments} py-3.5 text-center bg-gray-50 ${cellDivider}`}>
                    <MessageSquare className="w-4 h-4 mx-auto text-gray-400" />
                  </TableHead>
                )}
                
                {/* Files - Icon header */}
                {isVisible('docs') && (
                  <TableHead className={`${columnWidths.docs} py-3.5 text-center bg-gray-50 ${cellDivider}`}>
                    <Paperclip className="w-4 h-4 mx-auto text-gray-400" />
                  </TableHead>
                )}
                
                {/* Labels */}
                {isVisible('labels') && (
                  <TableHead className={`${columnWidths.labels} py-3.5 text-center bg-gray-50 ${cellDivider}`}>
                    <Tag className="w-4 h-4 mx-auto text-gray-400" />
                  </TableHead>
                )}
                
                {/* Start date */}
                {isVisible('start_date') && (
                  <TableHead className={`${columnWidths.startDate} py-3.5 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${cellDivider}`}>
                    Start
                  </TableHead>
                )}
                
                {/* Due date */}
                {isVisible('due_date') && (
                  <TableHead 
                    className={`${columnWidths.dueDate} py-3.5 bg-gray-50 cursor-pointer hover:bg-gray-100 text-left ${cellDivider}`}
                    onClick={() => handleSort('due_date')}
                  >
                    <div className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Due
                      {getSortIcon('due_date')}
                    </div>
                  </TableHead>
                )}
                
                {/* Updated */}
                {isVisible('updated') && (
                  <TableHead 
                    className={`${columnWidths.updated} py-3.5 bg-gray-50 cursor-pointer hover:bg-gray-100 text-left ${cellDivider}`}
                    onClick={() => handleSort('last_activity_at')}
                  >
                    <div className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Updated
                      {getSortIcon('last_activity_at')}
                    </div>
                  </TableHead>
                )}
                
                {/* Actions - no divider on last column */}
                <TableHead className={`${columnWidths.actions} py-3.5 bg-gray-50`}></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedRequests.map(({ category, requests: categoryRequests }) => {
                const completedCount = categoryRequests.filter(r => r.status === 'completed').length;
                
                return (
                  <React.Fragment key={category.id}>
                    {/* Category Header Row */}
                    <CategoryHeaderRow
                      categoryName={category.name}
                      completedCount={completedCount}
                      totalCount={categoryRequests.length}
                      colSpan={visibleColumnCount}
                    />
                    
                    {/* Request Rows for this Category */}
                    {categoryRequests.map((request) => {
                      const status = statusConfig[request.status] || statusConfig.open;
                      const StatusIcon = status.icon;
                      const dueDateStatus = getDueDateStatus(request.due_date, request.status);
                      const subcategoryName = getSubcategoryName(request.subcategory_id);
                      const counts = requestCounts[request.id] || { documentCount: 0, commentCount: 0 };
                      const assignees = getAssignees(request);
                      const assigneeIds = request.assignee_ids || [];
                      const isUnread = hasUnreadUpdates(request.id, request.last_activity_at, viewMap);
                      const showNewBadge = shouldShowNewBadge(request, counts.commentCount);
                      const isResolved = request.status === 'completed';
                      const isSelected = selectedRequests.includes(request.id);
                      
                      return (
                        <TableRow 
                          key={request.id}
                          className={`bg-white border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors group ${
                            isSelected ? 'bg-primary/5' : isResolved ? 'bg-green-50/30' : isUnread ? 'bg-blue-50/30' : ''
                          }`}
                          onClick={() => onSelectRequest(request)}
                        >
                          {/* Checkbox */}
                          <TableCell onClick={(e) => e.stopPropagation()} className={`${columnWidths.checkbox} py-3 text-center ${cellDivider}`}>
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(request.id)}
                            />
                          </TableCell>

                          {/* Title with optional NEW badge */}
                          <TableCell className={`${columnWidths.title} py-3 ${cellDivider}`}>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium flex items-center gap-2 ${
                                  isResolved ? 'text-muted-foreground line-through' : 'text-foreground'
                                }`}>
                                  <span className="truncate">{request.title}</span>
                                  {showNewBadge && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0 font-medium shrink-0">
                                      <Sparkles className="w-3 h-3 mr-0.5" />
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                {/* Only show subcategory if present */}
                                {subcategoryName && (
                                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {subcategoryName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Priority Flag */}
                          {isVisible('priority') && (
                            <TableCell className={`${columnWidths.priority} py-3 text-center ${cellDivider}`} onClick={(e) => e.stopPropagation()}>
                              <PriorityFlagCell requestId={request.id} priority={request.priority} />
                            </TableCell>
                          )}

                          {/* Status Badge */}
                          {isVisible('status') && (
                            <TableCell className={`${columnWidths.status} py-3 ${cellDivider}`} onClick={(e) => e.stopPropagation()}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs font-medium cursor-pointer ${status.className}`}
                                      >
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {status.label}
                                      </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="bg-popover">
                                      {Object.entries(statusConfig).map(([key, config]) => (
                                        <DropdownMenuItem
                                          key={key}
                                          onClick={() => updateRequest.mutate({ id: request.id, status: key as any })}
                                          className="text-sm"
                                        >
                                          <config.icon className="w-3 h-3 mr-2" />
                                          {config.label}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover text-popover-foreground">
                                  {status.description}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          )}

                          {/* Assignee */}
                          {isVisible('assignee') && (
                            <TableCell className={`${columnWidths.assignee} py-3 ${cellDivider}`}>
                              {assignees.length === 0 ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignToMe(request.id, assigneeIds);
                                  }}
                                >
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Assign
                                </Button>
                              ) : assignees.length === 1 ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={assignees[0].profile_picture_url || undefined} />
                                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                      {assignees[0].first_name?.[0]}{assignees[0].last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-foreground truncate max-w-[100px]">
                                    {assignees[0].first_name} {assignees[0].last_name?.[0]}.
                                  </span>
                                </div>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                      <div className="flex -space-x-2">
                                        {assignees.slice(0, 3).map((assignee) => (
                                          <Avatar key={assignee.user_id} className="h-6 w-6 border-2 border-background">
                                            <AvatarImage src={assignee.profile_picture_url || undefined} />
                                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                              {assignee.first_name?.[0]}{assignee.last_name?.[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                      </div>
                                      {assignees.length > 3 && (
                                        <span className="text-xs text-muted-foreground ml-1">+{assignees.length - 3}</span>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-popover">
                                    <div className="text-xs space-y-1">
                                      {assignees.map(a => (
                                        <div key={a.user_id}>{a.first_name} {a.last_name}</div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TableCell>
                          )}

                          {/* Reviewers */}
                          {isVisible('reviewers') && (
                            <TableCell className={`${columnWidths.reviewers} py-3 ${cellDivider}`} onClick={(e) => e.stopPropagation()}>
                              <ReviewersCell 
                                reviewerIds={request.reviewer_ids || []}
                                onAddReviewers={() => onSelectRequest(request)}
                              />
                            </TableCell>
                          )}

                          {/* Findings - with icon */}
                          {isVisible('findings') && (
                            <TableCell className={`${columnWidths.findings} py-3 text-center ${cellDivider}`}>
                              <div className="flex items-center justify-center gap-1">
                                <Search className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground tabular-nums">0</span>
                              </div>
                            </TableCell>
                          )}

                          {/* Reply Count - with icon */}
                          {isVisible('comments') && (
                            <TableCell className={`${columnWidths.comments} py-3 text-center ${cellDivider}`}>
                              <div className="flex items-center justify-center gap-1">
                                <MessageSquare className={`w-3 h-3 ${counts.commentCount > 0 ? (isUnread ? 'text-amber-500' : 'text-primary') : 'text-muted-foreground'}`} />
                                <span className={`text-xs tabular-nums ${counts.commentCount > 0 ? (isUnread ? 'text-amber-500 font-medium' : 'text-primary font-medium') : 'text-muted-foreground'}`}>
                                  {counts.commentCount}
                                </span>
                              </div>
                            </TableCell>
                          )}

                          {/* Files Count - with icon */}
                          {isVisible('docs') && (
                            <TableCell className={`${columnWidths.docs} py-3 text-center ${cellDivider}`}>
                              <div className="flex items-center justify-center gap-1">
                                <Paperclip className={`w-3 h-3 ${counts.documentCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`text-xs tabular-nums ${counts.documentCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                  {counts.documentCount}
                                </span>
                              </div>
                            </TableCell>
                          )}

                          {/* Labels */}
                          {isVisible('labels') && (
                            <TableCell className={`${columnWidths.labels} py-3 text-center ${cellDivider}`}>
                              <span className="text-xs text-muted-foreground">—</span>
                            </TableCell>
                          )}

                          {/* Start Date */}
                          {isVisible('start_date') && (
                            <TableCell className={`${columnWidths.startDate} py-3 ${cellDivider}`}>
                              <span className="text-xs text-foreground">
                                {isThisYear(new Date(request.created_at)) 
                                  ? format(new Date(request.created_at), 'MMM d')
                                  : format(new Date(request.created_at), 'MMM d, yyyy')}
                              </span>
                            </TableCell>
                          )}

                          {/* Due Date */}
                          {isVisible('due_date') && (
                            <TableCell className={`${columnWidths.dueDate} py-3 ${cellDivider}`}>
                              {request.due_date ? (
                                <span className={`text-xs font-medium ${
                                  dueDateStatus === 'overdue' 
                                    ? 'text-destructive' 
                                    : dueDateStatus === 'due-soon' 
                                      ? 'text-amber-600' 
                                      : 'text-foreground'
                                }`}>
                                  {format(new Date(request.due_date), 'MMM d')}
                                  {dueDateStatus === 'overdue' && (
                                    <AlertTriangle className="w-3 h-3 inline ml-1" />
                                  )}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          )}

                          {/* Updated */}
                          {isVisible('updated') && (
                            <TableCell className={`${columnWidths.updated} py-3 ${cellDivider}`}>
                              <LastUpdatedCell 
                                lastActivityAt={request.last_activity_at} 
                                updatedBy={request.updated_by || undefined}
                              />
                            </TableCell>
                          )}

                          {/* Actions Menu */}
                          <TableCell className={`${columnWidths.actions} py-3`} onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover w-48">
                          <DropdownMenuItem onClick={() => onSelectRequest(request)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignToMe(request.id, assigneeIds)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign to Me
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Change Priority</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="bg-popover">
                              <DropdownMenuItem onClick={() => updateRequest.mutate({ id: request.id, priority: 'high' })}>
                                🔴 High
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequest.mutate({ id: request.id, priority: 'medium' })}>
                                🟠 Medium
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequest.mutate({ id: request.id, priority: 'low' })}>
                                ⚪ Normal
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="bg-popover">
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => updateRequest.mutate({ id: request.id, status: key as any })}
                                >
                                  <config.icon className="w-3 h-3 mr-2" />
                                  {config.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => updateRequest.mutate({ id: request.id, status: 'in_progress' })}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send to Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateRequest.mutate({ id: request.id, status: 'completed' })}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Resolved
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm('Delete this request?')) {
                                deleteRequest.mutate({ id: request.id, dealId: request.deal_id });
                              }
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedRequests.length}
          totalCount={requests.length}
          onClearSelection={clearSelection}
          onSelectAll={selectAll}
          onMarkResolved={handleBulkMarkResolved}
          onMarkInProgress={handleBulkMarkInProgress}
          onAssignTo={handleBulkAssign}
          onSendToCustomer={handleBulkSendToCustomer}
          onDelete={handleBulkDelete}
          isProcessing={isProcessing}
        />
      </div>
    </TooltipProvider>
  );
};

export default DiligenceRequestTable;
