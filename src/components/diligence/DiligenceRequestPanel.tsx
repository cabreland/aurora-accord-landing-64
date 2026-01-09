import React, { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { formatSmartTimestamp, formatCompactTimestamp } from '@/lib/formatTimestamp';
import { useDropzone } from 'react-dropzone';
import { 
  X, 
  User,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Send,
  Paperclip,
  Download,
  Trash2,
  History,
  Loader2,
  File
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { 
  DiligenceRequest, 
  DiligenceCategory, 
  DiligenceSubcategory,
  useUpdateDiligenceRequest
} from '@/hooks/useDiligenceTracker';
import ThreadedCommentsSection from './ThreadedCommentsSection';
import {
  useTeamMembers,
  getTeamMemberName,
  getTeamMemberInitials
} from '@/hooks/useTeamMembers';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useDiligenceDocuments,
  useUploadDiligenceDocument,
  useDeleteDiligenceDocument,
  useDownloadDiligenceDocument,
  formatFileSize
} from '@/hooks/useDiligenceDocuments';
import { useMarkRequestViewed } from '@/hooks/useRequestViews';
import UserAvatarBadge, { 
  getAvatarColor, 
  getUserInitials, 
  getUserDisplayName,
  getRoleDisplayName 
} from '@/components/common/UserAvatarBadge';
import StackedAvatars, { AssigneeInfo } from '@/components/common/StackedAvatars';
import MultiAssigneeSelector from '@/components/common/MultiAssigneeSelector';

interface DiligenceRequestPanelProps {
  request: DiligenceRequest | null;
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  onClose: () => void;
}

const statusConfig = {
  open: { label: 'Open', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  completed: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  blocked: { label: 'Blocked', color: 'text-red-600', bg: 'bg-red-100 border-red-300' },
};

const priorityConfig = {
  high: { label: 'High', color: 'text-red-600', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300', dot: 'bg-gray-400' },
};

// Helper to get display name from profile
const getCommentAuthorName = (profile: { first_name: string | null; last_name: string | null; email: string } | null | undefined): string => {
  if (!profile) return 'Unknown User';
  
  const firstName = profile.first_name?.trim();
  const lastName = profile.last_name?.trim();
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) return firstName;
  if (lastName) return lastName;
  
  // Fallback to email username
  return profile.email?.split('@')[0] || 'Unknown User';
};

// Helper to get initials for avatar
const getCommentAuthorInitials = (profile: { first_name: string | null; last_name: string | null; email: string } | null | undefined): string => {
  if (!profile) return 'U';
  
  const firstName = profile.first_name?.trim();
  const lastName = profile.last_name?.trim();
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName[0].toUpperCase();
  if (lastName) return lastName[0].toUpperCase();
  
  // Fallback to email first letter
  return profile.email?.[0]?.toUpperCase() || 'U';
};

// Activity Tab Component with real user data
interface ActivityTabProps {
  request: DiligenceRequest;
  teamMembers: Array<{
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: string;
    profile_picture_url: string | null;
  }>;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ request, teamMembers }) => {
  // Find the user who created the request
  const creator = teamMembers.find(m => m.user_id === request.created_by);
  const creatorName = creator 
    ? getUserDisplayName(creator.first_name, creator.last_name, creator.email)
    : 'Unknown User';
  const creatorColor = getAvatarColor(request.created_by);
  const creatorInitials = creator 
    ? getUserInitials(creator.first_name, creator.last_name, creator.email)
    : '?';
  
  // Find assignee if any
  const assignee = request.assignee_id 
    ? teamMembers.find(m => m.user_id === request.assignee_id)
    : null;
  const assigneeName = assignee 
    ? getUserDisplayName(assignee.first_name, assignee.last_name, assignee.email)
    : null;
  const assigneeRole = assignee ? getRoleDisplayName(assignee.role) : null;
  
  // Build activity items
  const activities: Array<{
    id: string;
    type: 'created' | 'status' | 'assigned' | 'updated';
    icon: React.ReactNode;
    bgColor: string;
    content: React.ReactNode;
    timestamp: string;
    userId?: string | null;
  }> = [];
  
  // Request created
  activities.push({
    id: 'created',
    type: 'created',
    icon: <History className="w-4 h-4 text-gray-600" />,
    bgColor: 'bg-gray-100',
    content: (
      <span>
        <span className="font-medium">Request created</span> by{' '}
        <span className="font-medium">{creatorName}</span>
      </span>
    ),
    timestamp: request.created_at,
    userId: request.created_by
  });
  
  // Assignment if exists
  if (request.assignee_id && assigneeName) {
    activities.push({
      id: 'assigned',
      type: 'assigned',
      icon: <User className="w-4 h-4 text-blue-600" />,
      bgColor: 'bg-blue-100',
      content: (
        <span>
          <span className="font-medium">Assigned to</span>{' '}
          <span className="font-medium">{assigneeName}</span>
          {assigneeRole && <span className="text-gray-500"> ({assigneeRole})</span>}
        </span>
      ),
      timestamp: request.updated_at,
      userId: request.assignee_id
    });
  }
  
  // Status change if different from initial
  if (request.status !== 'open') {
    const statusLabels: Record<string, string> = {
      in_progress: 'In Progress',
      completed: 'Resolved',
      blocked: 'Blocked'
    };
    const statusColors: Record<string, { icon: string; bg: string }> = {
      in_progress: { icon: 'text-amber-600', bg: 'bg-amber-100' },
      completed: { icon: 'text-green-600', bg: 'bg-green-100' },
      blocked: { icon: 'text-red-600', bg: 'bg-red-100' }
    };
    const statusConfig = statusColors[request.status] || { icon: 'text-gray-600', bg: 'bg-gray-100' };
    
    activities.push({
      id: 'status',
      type: 'status',
      icon: request.status === 'completed' 
        ? <CheckCircle2 className={`w-4 h-4 ${statusConfig.icon}`} />
        : request.status === 'blocked'
          ? <AlertTriangle className={`w-4 h-4 ${statusConfig.icon}`} />
          : <Clock className={`w-4 h-4 ${statusConfig.icon}`} />,
      bgColor: statusConfig.bg,
      content: (
        <span>
          <span className="font-medium">Status changed</span> to{' '}
          <span className="font-medium">{statusLabels[request.status] || request.status}</span>
        </span>
      ),
      timestamp: request.updated_at,
      userId: request.updated_by
    });
  }
  
  // Sort by timestamp descending (most recent first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className={`w-8 h-8 rounded-full ${activity.bgColor} flex items-center justify-center shrink-0`}>
            {activity.icon}
          </div>
          <div>
            <div className="text-sm text-gray-900">
              {activity.content}
            </div>
            <div className="text-xs text-gray-500">
              {formatSmartTimestamp(activity.timestamp)}
            </div>
          </div>
        </div>
      ))}
      
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          No activity recorded yet
        </div>
      )}
    </div>
  );
};

const DiligenceRequestPanel: React.FC<DiligenceRequestPanelProps> = ({
  request,
  categories,
  subcategories,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  
  // Local state for optimistic UI updates
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [localPriority, setLocalPriority] = useState<string | null>(null);
  const [localDueDate, setLocalDueDate] = useState<Date | undefined>(undefined);
  
  // Reset local state when request changes
  useEffect(() => {
    setLocalStatus(null);
    setLocalPriority(null);
    setLocalDueDate(undefined);
  }, [request?.id]);
  
  const updateRequest = useUpdateDiligenceRequest();
  const { data: teamMembers = [] } = useTeamMembers();
  
  // Document hooks
  const { data: documents = [], refetch: refetchDocuments } = useDiligenceDocuments(request?.id || '');
  const uploadDocument = useUploadDiligenceDocument();
  const deleteDocument = useDeleteDiligenceDocument();
  const downloadDocument = useDownloadDiligenceDocument();
  const markViewed = useMarkRequestViewed();
  
  // Get assigned team members (supports multiple)
  const getAssignedMembers = (): AssigneeInfo[] => {
    const assigneeIds = request?.assignee_ids?.length > 0 
      ? request.assignee_ids 
      : request?.assignee_id 
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
  
  const assignedMembers = getAssignedMembers();
  
  // Mark request as viewed when panel opens
  useEffect(() => {
    if (request?.id) {
      markViewed.mutate(request.id);
    }
  }, [request?.id]);
  
  // Dropzone for file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!request?.id) return;
    
    for (const file of acceptedFiles) {
      await uploadDocument.mutateAsync({
        requestId: request.id,
        file
      });
    }
    refetchDocuments();
  }, [request?.id, uploadDocument, refetchDocuments]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    maxSize: 52428800 // 50MB
  });
  
  const handleDeleteDocument = async (doc: { id: string; storage_path: string }) => {
    if (!request?.id) return;
    await deleteDocument.mutateAsync({
      documentId: doc.id,
      storagePath: doc.storage_path,
      requestId: request.id
    });
  };
  
  const handleDownloadDocument = (doc: { storage_path: string; file_name: string }) => {
    downloadDocument.mutate({
      storagePath: doc.storage_path,
      fileName: doc.file_name
    });
  };
  
  // Get file icon based on type
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="w-8 h-8 text-gray-400" />;
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-8 h-8 text-blue-600" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FileText className="w-8 h-8 text-green-600" />;
    if (fileType.includes('image')) return <FileText className="w-8 h-8 text-purple-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };
  
  if (!request) return null;
  
  const category = categories.find(c => c.id === request.category_id);
  const subcategory = subcategories.find(s => s.id === request.subcategory_id);
  
  // Use local state for immediate UI feedback, fallback to request data
  const currentStatus = (localStatus || request.status) as keyof typeof statusConfig;
  const currentPriority = (localPriority || request.priority) as keyof typeof priorityConfig;
  const currentDueDate = localDueDate || (request.due_date ? new Date(request.due_date) : undefined);
  
  const status = statusConfig[currentStatus];
  const priority = priorityConfig[currentPriority];
  
  const handleStatusChange = (newStatus: string) => {
    // Optimistically update local state
    setLocalStatus(newStatus);
    updateRequest.mutate({
      id: request.id,
      status: newStatus as DiligenceRequest['status'],
      completion_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
    });
  };
  
  const handlePriorityChange = (newPriority: string) => {
    // Optimistically update local state
    setLocalPriority(newPriority);
    updateRequest.mutate({
      id: request.id,
      priority: newPriority as DiligenceRequest['priority']
    });
  };
  
  const handleDueDateChange = (date: Date | undefined) => {
    setLocalDueDate(date);
    setDueDateOpen(false);
    updateRequest.mutate({
      id: request.id,
      due_date: date ? date.toISOString().split('T')[0] : null
    });
  };
  
  const handleAssigneesChange = (selectedIds: string[]) => {
    updateRequest.mutate({
      id: request.id,
      assignee_ids: selectedIds,
      assignee_id: selectedIds[0] || null // Keep legacy field in sync
    });
    setAssigneePopoverOpen(false);
  };
  
  // Comment handling is now in ThreadedCommentsSection
  
  const handleMarkComplete = () => {
    updateRequest.mutate({
      id: request.id,
      status: 'completed',
      completion_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Sheet open={!!request} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px] bg-white border-l border-gray-200 p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {category?.name}
                {subcategory && ` › ${subcategory.name}`}
              </div>
              <SheetTitle className="text-lg font-semibold text-gray-900 leading-tight">
                {request.title}
              </SheetTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>
        
        {/* Status & Priority Controls */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1.5">Status</label>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-white border-gray-200 h-9">
                  <Badge 
                    variant="outline" 
                    className={`${status.bg} ${status.color} border font-medium`}
                  >
                    {status.label}
                  </Badge>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <Badge 
                        variant="outline" 
                        className={`${config.bg} ${config.color} border`}
                      >
                        {config.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1.5">Priority</label>
              <Select value={currentPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="bg-white border-gray-200 h-9">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
                    <span className={`text-sm ${priority.color}`}>{priority.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 h-9 p-1 bg-gray-100 justify-start w-fit">
            <TabsTrigger value="details" className="text-sm data-[state=active]:bg-white">
              Details
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-sm data-[state=active]:bg-white">
              Documents {documents.length > 0 && `(${documents.length})`}
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-sm data-[state=active]:bg-white">
              Comments
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-sm data-[state=active]:bg-white">
              Activity
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="details" className="p-4 space-y-5 mt-0">
              {/* Assignees */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                  <Users className="w-3.5 h-3.5 inline mr-1.5" />
                  Assigned To ({assignedMembers.length})
                </label>
                <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                  <PopoverTrigger asChild>
                    {assignedMembers.length > 0 ? (
                      <button className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200 w-full text-left hover:bg-gray-100 transition-colors">
                        <StackedAvatars 
                          assignees={assignedMembers}
                          maxVisible={4}
                          size="md"
                          showTooltip={false}
                          className="flex-1"
                        />
                      </button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 justify-start"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Click to assign team members
                      </Button>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" align="start">
                    <MultiAssigneeSelector
                      teamMembers={teamMembers}
                      selectedIds={request.assignee_ids || (request.assignee_id ? [request.assignee_id] : [])}
                      onSelectionChange={handleAssigneesChange}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Due Date */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Due Date
                </label>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal bg-gray-50 border-gray-200 hover:bg-gray-100 h-auto py-3"
                    >
                      {currentDueDate 
                        ? format(currentDueDate, 'MMMM d, yyyy')
                        : <span className="text-gray-500">No due date set - click to add</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={currentDueDate}
                      onSelect={handleDueDateChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Description */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                  Description
                </label>
                {request.description ? (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-700 leading-relaxed">
                    {request.description}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-300 text-sm text-gray-400 italic">
                    No description provided
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="p-4 mt-0">
              {/* Upload Zone */}
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer mb-4 ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                } ${uploadDocument.isPending ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input {...getInputProps()} />
                {uploadDocument.isPending ? (
                  <>
                    <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      Uploading...
                    </p>
                  </>
                ) : isDragActive ? (
                  <>
                    <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      Drop files here
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Drag and drop files here
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      PDF, Word, Excel, images up to 50MB
                    </p>
                    <Button size="sm" variant="outline" className="border-gray-300" type="button">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
              
              {/* Document List */}
              {documents.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Uploaded Files ({documents.length})
                  </h4>
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.file_type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {doc.file_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(doc.file_size)} • {formatCompactTimestamp(doc.created_at, { showTimezone: false })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                          onClick={() => handleDownloadDocument(doc)}
                          disabled={downloadDocument.isPending}
                        >
                          {downloadDocument.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400 hover:text-red-600"
                          onClick={() => handleDeleteDocument(doc)}
                          disabled={deleteDocument.isPending}
                        >
                          {deleteDocument.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No documents uploaded yet
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comments" className="p-4 mt-0">
              <ThreadedCommentsSection requestId={request.id} />
            </TabsContent>
            
            <TabsContent value="activity" className="p-4 mt-0">
              <ActivityTab 
                request={request} 
                teamMembers={teamMembers} 
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {request.status !== 'completed' && (
              <Button 
                onClick={handleMarkComplete}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={onClose}
              className={`border-gray-300 text-gray-700 hover:bg-gray-100 ${
                request.status === 'completed' ? 'flex-1' : ''
              }`}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DiligenceRequestPanel;
