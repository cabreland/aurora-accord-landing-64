import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Paperclip,
  Download,
  Trash2,
  History,
  Loader2,
  File,
  RotateCcw
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DiligenceRequest, 
  DiligenceCategory, 
  DiligenceSubcategory,
  useUpdateDiligenceRequest,
  useDiligenceComments
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
import { 
  getAvatarColor, 
  getUserInitials, 
  getUserDisplayName,
  getRoleDisplayName 
} from '@/components/common/UserAvatarBadge';
import StackedAvatars, { AssigneeInfo } from '@/components/common/StackedAvatars';
import MultiAssigneeSelector from '@/components/common/MultiAssigneeSelector';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRequestActivity } from '@/hooks/useRequestActivity';

interface DiligenceRequestModalProps {
  request: DiligenceRequest | null;
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  onClose: () => void;
  // Partner permission props
  canAnswerDDQuestions?: boolean;
}

const statusConfig = {
  open: { label: 'Open', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', dot: 'bg-amber-500' },
  completed: { label: 'Resolved', color: 'text-green-700', bg: 'bg-green-100 border-green-200', dot: 'bg-green-500' },
  blocked: { label: 'Blocked', color: 'text-red-700', bg: 'bg-red-100 border-red-200', dot: 'bg-red-500' },
};

const priorityConfig = {
  high: { label: 'High', color: 'text-red-700', bg: 'bg-red-100 border-red-200', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-300', dot: 'bg-gray-400' },
};

// Activity Tab Component with real-time comment tracking
interface ActivityTabProps {
  request: DiligenceRequest;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ request }) => {
  const { data: activities = [], isLoading } = useRequestActivity(request.id);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return { icon: <History className="w-4 h-4 text-gray-600" />, bg: 'bg-gray-100' };
      case 'assigned':
        return { icon: <User className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-100' };
      case 'status':
        return { icon: <Clock className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-100' };
      case 'resolved':
        return { icon: <CheckCircle2 className="w-4 h-4 text-green-600" />, bg: 'bg-green-100' };
      case 'comment':
        return { icon: <MessageSquare className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-100' };
      case 'reply':
        return { icon: <MessageSquare className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-100' };
      default:
        return { icon: <History className="w-4 h-4 text-gray-600" />, bg: 'bg-gray-100' };
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const { icon, bg } = getActivityIcon(activity.type);
        return (
          <div key={activity.id} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div>
              <div className="text-sm text-gray-900">
                <span className="font-medium">{activity.content}</span>
                {activity.userName !== 'System' && (
                  <> by <span className="font-medium">{activity.userName}</span></>
                )}
              </div>
              <div className="text-xs text-gray-500">{activity.formattedTime}</div>
            </div>
          </div>
        );
      })}
      
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          No activity recorded yet
        </div>
      )}
    </div>
  );
};


const DiligenceRequestModal: React.FC<DiligenceRequestModalProps> = ({
  request,
  categories,
  subcategories,
  onClose,
  canAnswerDDQuestions = true
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  // Local state for optimistic UI updates
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [localPriority, setLocalPriority] = useState<string | null>(null);
  const [localDueDate, setLocalDueDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    setLocalStatus(null);
    setLocalPriority(null);
    setLocalDueDate(undefined);
    setEditedDescription(request?.description || '');
    setOriginalDescription(request?.description || '');
    setIsEditingDescription(false);
  }, [request?.id]);
  
  const updateRequest = useUpdateDiligenceRequest();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: comments = [] } = useDiligenceComments(request?.id || '');
  const commentCount = comments.length;
  
  // Document hooks
  const { data: documents = [], refetch: refetchDocuments } = useDiligenceDocuments(request?.id || '');
  const uploadDocument = useUploadDiligenceDocument();
  const deleteDocument = useDeleteDiligenceDocument();
  const downloadDocument = useDownloadDiligenceDocument();
  const markViewed = useMarkRequestViewed();
  
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
    toast.success('Document uploaded');
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
    maxSize: 20971520 // 20MB
  });
  
  const handleDeleteDocument = async (doc: { id: string; storage_path: string }) => {
    if (!request?.id) return;
    await deleteDocument.mutateAsync({
      documentId: doc.id,
      storagePath: doc.storage_path,
      requestId: request.id
    });
    toast.success('Document deleted');
  };
  
  const handleDownloadDocument = (doc: { storage_path: string; file_name: string }) => {
    downloadDocument.mutate({
      storagePath: doc.storage_path,
      fileName: doc.file_name
    });
  };
  
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
  
  const currentStatus = (localStatus || request.status) as keyof typeof statusConfig;
  const currentPriority = (localPriority || request.priority) as keyof typeof priorityConfig;
  const currentDueDate = localDueDate || (request.due_date ? new Date(request.due_date) : undefined);
  
  const status = statusConfig[currentStatus];
  const priority = priorityConfig[currentPriority];
  
  const handleStatusChange = (newStatus: string) => {
    setLocalStatus(newStatus);
    updateRequest.mutate({
      id: request.id,
      status: newStatus as DiligenceRequest['status'],
      completion_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
    });
  };
  
  const handlePriorityChange = (newPriority: string) => {
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
      assignee_id: selectedIds[0] || null
    });
    setAssigneePopoverOpen(false);
  };
  
  const handleDescriptionSave = async () => {
    if (editedDescription === originalDescription) {
      setIsEditingDescription(false);
      return;
    }
    
    setIsSavingDescription(true);
    try {
      await updateRequest.mutateAsync({
        id: request.id,
        description: editedDescription.trim() || null
      });
      setOriginalDescription(editedDescription);
      setIsEditingDescription(false);
      toast.success('Description saved');
    } catch (error) {
      toast.error('Failed to save description');
    } finally {
      setIsSavingDescription(false);
    }
  };
  
  const handleDescriptionCancel = () => {
    setEditedDescription(originalDescription);
    setIsEditingDescription(false);
  };
  
  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleDescriptionCancel();
    }
  };
  
  const handleMarkComplete = () => {
    setShowResolveConfirm(true);
  };
  
  const confirmResolve = () => {
    setLocalStatus('completed');
    updateRequest.mutate({
      id: request.id,
      status: 'completed',
      completion_date: new Date().toISOString().split('T')[0]
    });
    setShowResolveConfirm(false);
    toast.success('Request marked as resolved');
  };
  
  const handleReopen = () => {
    setShowReopenConfirm(true);
  };
  
  const confirmReopen = () => {
    setLocalStatus('in_progress');
    updateRequest.mutate({
      id: request.id,
      status: 'in_progress',
      completion_date: null
    });
    setShowReopenConfirm(false);
    toast.success('Request reopened');
  };

  const hasDescriptionChanges = editedDescription !== originalDescription;

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 flex flex-col bg-white",
          "w-[95vw] md:w-[80vw] lg:w-[65vw]",
          "max-w-[900px] min-w-[320px] md:min-w-[600px]",
          "h-[90vh] md:h-[85vh]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4",
          "duration-200"
        )}
        aria-describedby="request-modal-description"
      >
        {/* Header */}
        <div className={cn(
          "p-4 md:p-6 border-b border-gray-200 shrink-0 transition-colors",
          currentStatus === 'completed' ? 'bg-green-50/50' : 'bg-gray-50'
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <DialogTitle className="text-xl font-semibold text-gray-900 truncate">
                  {request.title}
                </DialogTitle>
                {currentStatus === 'completed' && (
                  <Badge className="bg-green-600 text-white shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Resolved
                  </Badge>
                )}
                <Badge variant="outline" className="shrink-0 bg-gray-100 text-gray-700 border-gray-300">
                  {category?.name || 'Uncategorized'}
                </Badge>
              </div>
              <DialogDescription id="request-modal-description" className="sr-only">
                Diligence request details for {request.title}
              </DialogDescription>
            </div>
          </div>
          
          {/* Status & Priority Controls - only editable with permission */}
          {canAnswerDDQuestions ? (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1">
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="bg-white border-gray-200 h-10">
                    <Badge 
                      variant="outline" 
                      className={`${status.bg} ${status.color} border font-medium`}
                    >
                      {status.label}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 z-[100]">
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
                <Select value={currentPriority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="bg-white border-gray-200 h-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
                      <span className={`text-sm ${priority.color}`}>{priority.label}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 z-[100]">
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
          ) : (
            <div className="flex items-center gap-3 mt-4">
              <Badge 
                variant="outline" 
                className={`${status.bg} ${status.color} border font-medium`}
              >
                {status.label}
              </Badge>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
                <span className={`text-sm ${priority.color}`}>{priority.label}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 md:mx-6 mt-4 h-10 p-1 bg-gray-100 justify-start w-fit shrink-0">
            <TabsTrigger value="details" className="text-sm data-[state=active]:bg-white px-4">
              Details
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-sm data-[state=active]:bg-white px-4">
              Documents {documents.length > 0 && <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">{documents.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-sm data-[state=active]:bg-white px-4">
              Comments {commentCount > 0 && <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">{commentCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-sm data-[state=active]:bg-white px-4">
              Activity
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 px-4 md:px-6">
            <TabsContent value="details" className="py-4 space-y-6 mt-0">
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
                          maxVisible={5}
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
                  <PopoverContent className="w-80 p-3 z-[100]" align="start">
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
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
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
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      ref={descriptionRef}
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onKeyDown={handleDescriptionKeyDown}
                      placeholder="Add a description..."
                      className="bg-white border-blue-400 ring-2 ring-blue-100 min-h-[120px] text-sm resize-none focus:ring-2 focus:ring-blue-200"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={handleDescriptionSave}
                        disabled={!hasDescriptionChanges || isSavingDescription}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSavingDescription ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Saving...
                          </>
                        ) : 'Save'}
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={handleDescriptionCancel}
                        disabled={isSavingDescription}
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">Press ESC to cancel</p>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      setIsEditingDescription(true);
                      setEditedDescription(request.description || '');
                      setOriginalDescription(request.description || '');
                    }}
                    className={cn(
                      "rounded-lg p-3 border text-sm cursor-pointer transition-all min-h-[80px] group",
                      request.description 
                        ? "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50/50 hover:border-blue-300"
                        : "bg-gray-50 border-dashed border-gray-300 text-gray-400 italic hover:bg-blue-50/50 hover:border-blue-300"
                    )}
                    title="Click to edit"
                  >
                    <span className="whitespace-pre-wrap">{request.description || 'Click to add description...'}</span>
                    <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">Click to edit</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="py-4 mt-0">
              {/* Upload Zone - only show if user has permission */}
              {canAnswerDDQuestions ? (
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors cursor-pointer mb-4",
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50',
                    uploadDocument.isPending && 'opacity-50 pointer-events-none'
                  )}
                >
                  <input {...getInputProps()} />
                  {uploadDocument.isPending ? (
                    <>
                      <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
                      <p className="text-sm font-medium text-blue-600 mb-1">Uploading...</p>
                    </>
                  ) : isDragActive ? (
                    <>
                      <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-blue-600 mb-1">Drop files here</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop files here</p>
                      <p className="text-xs text-gray-500 mb-3">PDF, Word, Excel, images up to 20MB</p>
                      <Button size="sm" variant="outline" className="border-gray-300" type="button">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-lg p-4 bg-muted/50 border border-dashed border-muted-foreground/30 text-center mb-4">
                  <p className="text-sm text-muted-foreground">You don't have permission to upload documents</p>
                </div>
              )}
              
              {/* Document List */}
              {documents.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Uploaded Files ({documents.length})
                  </h4>
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getFileIcon(doc.file_type)}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {doc.file_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(doc.file_size)} • {formatCompactTimestamp(doc.created_at, { showTimezone: false })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                          onClick={() => handleDownloadDocument(doc)}
                          disabled={downloadDocument.isPending}
                          aria-label="Download document"
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
                          aria-label="Delete document"
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
                <div className="text-center py-8 text-gray-500 text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No documents uploaded yet
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comments" className="py-4 mt-0">
              <ThreadedCommentsSection requestId={request.id} />
            </TabsContent>
            
            <TabsContent value="activity" className="py-4 mt-0">
              <ActivityTab request={request} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Footer Actions */}
        <div className={cn(
          "p-4 md:p-6 border-t border-gray-200 shrink-0 transition-colors",
          currentStatus === 'completed' ? 'bg-green-50/50' : 'bg-gray-50'
        )}>
          <div className="flex gap-3 justify-between">
            {canAnswerDDQuestions && currentStatus === 'completed' ? (
              <Button 
                onClick={handleReopen}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reopen Request
              </Button>
            ) : canAnswerDDQuestions && (currentStatus === 'open' || currentStatus === 'in_progress') ? (
              <Button 
                onClick={handleMarkComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={updateRequest.isPending}
              >
                {updateRequest.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Mark as Resolved
              </Button>
            ) : <div />}
            <div className="flex-1" />
            <Button 
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        </div>
        
        {/* Resolve Confirmation Dialog */}
        <AlertDialog open={showResolveConfirm} onOpenChange={setShowResolveConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Resolved?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this request as resolved? Team members will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmResolve}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark as Resolved
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Reopen Confirmation Dialog */}
        <AlertDialog open={showReopenConfirm} onOpenChange={setShowReopenConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reopen Request?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reopen this request? It will be set back to "In Progress" status.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmReopen}>
                Reopen Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default DiligenceRequestModal;
