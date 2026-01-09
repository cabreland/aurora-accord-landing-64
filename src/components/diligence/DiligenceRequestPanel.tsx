import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { formatSmartTimestamp, formatCompactTimestamp } from '@/lib/formatTimestamp';
import { useDropzone } from 'react-dropzone';
import { 
  X, 
  User,
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
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { 
  DiligenceRequest, 
  DiligenceCategory, 
  DiligenceSubcategory,
  useUpdateDiligenceRequest,
  useDiligenceComments,
  useAddDiligenceComment
} from '@/hooks/useDiligenceTracker';
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

interface DiligenceRequestPanelProps {
  request: DiligenceRequest | null;
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  onClose: () => void;
}

const statusConfig = {
  open: { label: 'Open', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  completed: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  blocked: { label: 'Blocked', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300' },
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

const DiligenceRequestPanel: React.FC<DiligenceRequestPanelProps> = ({
  request,
  categories,
  subcategories,
  onClose
}) => {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  
  const updateRequest = useUpdateDiligenceRequest();
  const { data: comments = [], refetch: refetchComments } = useDiligenceComments(request?.id || '');
  const addComment = useAddDiligenceComment();
  const { data: teamMembers = [] } = useTeamMembers();
  
  // Document hooks
  const { data: documents = [], refetch: refetchDocuments } = useDiligenceDocuments(request?.id || '');
  const uploadDocument = useUploadDiligenceDocument();
  const deleteDocument = useDeleteDiligenceDocument();
  const downloadDocument = useDownloadDiligenceDocument();
  
  // Find assigned team member
  const assignedMember = teamMembers.find(m => m.user_id === request?.assignee_id);
  
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
  const status = statusConfig[request.status];
  const priority = priorityConfig[request.priority];
  
  const handleStatusChange = (newStatus: string) => {
    updateRequest.mutate({
      id: request.id,
      status: newStatus as DiligenceRequest['status'],
      completion_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
    });
  };
  
  const handlePriorityChange = (newPriority: string) => {
    updateRequest.mutate({
      id: request.id,
      priority: newPriority as DiligenceRequest['priority']
    });
  };
  
  const handleAssigneeChange = (userId: string | null) => {
    updateRequest.mutate({
      id: request.id,
      assignee_id: userId
    });
    setAssigneePopoverOpen(false);
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment.mutateAsync({ 
        requestId: request.id, 
        content: newComment.trim() 
      });
      setNewComment('');
      // Refetch comments to update count and list
      refetchComments();
    } catch (error) {
      // Error is handled in the mutation
    }
  };
  
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
              <Select value={request.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-white border-gray-200 h-9">
                  <Badge 
                    variant="outline" 
                    className={`${status.bg} ${status.color} border font-medium`}
                  >
                    {status.label}
                  </Badge>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
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
              <Select value={request.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="bg-white border-gray-200 h-9">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
                    <span className={`text-sm ${priority.color}`}>{priority.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
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
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-sm data-[state=active]:bg-white">
              Activity
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="details" className="p-4 space-y-5 mt-0">
              {/* Assignee */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                  <User className="w-3.5 h-3.5 inline mr-1.5" />
                  Assigned To
                </label>
                <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                  <PopoverTrigger asChild>
                    {assignedMember ? (
                      <button className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200 w-full text-left hover:bg-gray-100 transition-colors">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                            {getTeamMemberInitials(assignedMember)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-900 font-medium flex-1">
                          {getTeamMemberName(assignedMember)}
                        </span>
                        <X 
                          className="w-4 h-4 text-gray-400 hover:text-red-500" 
                          onClick={(e) => { e.stopPropagation(); handleAssigneeChange(null); }}
                        />
                      </button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 justify-start"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Click to assign someone
                      </Button>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1">
                        Team Members
                      </p>
                      {teamMembers.length === 0 ? (
                        <p className="text-sm text-gray-500 px-2 py-2">No team members found</p>
                      ) : (
                        teamMembers.map((member) => (
                          <button
                            key={member.user_id}
                            className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
                            onClick={() => handleAssigneeChange(member.user_id)}
                          >
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                                {getTeamMemberInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {getTeamMemberName(member)}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {member.email}
                              </div>
                            </div>
                            {member.user_id === request.assignee_id && (
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Due Date */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Due Date
                </label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-gray-900">
                  {request.due_date 
                    ? format(new Date(request.due_date), 'MMMM d, yyyy')
                    : 'No due date set'
                  }
                </div>
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
              {/* Comment Input */}
              <div className="mb-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none mb-2"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button 
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addComment.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
              
              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                            {getCommentAuthorInitials(comment.profile)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-900">
                          {getCommentAuthorName(comment.profile)}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">
                          {formatCompactTimestamp(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 pl-8">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="activity" className="p-4 mt-0">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">Status changed</span> to Resolved
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatSmartTimestamp(request.updated_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">Assigned</span> to John Doe
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatSmartTimestamp(request.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">Request created</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatSmartTimestamp(request.created_at)}
                    </div>
                  </div>
                </div>
              </div>
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
