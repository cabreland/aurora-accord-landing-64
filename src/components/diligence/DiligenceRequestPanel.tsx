import React, { useState } from 'react';
import { format } from 'date-fns';
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
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

interface DiligenceRequestPanelProps {
  request: DiligenceRequest | null;
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  onClose: () => void;
}

const statusConfig = {
  open: { label: 'Open', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Circle },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
};

const priorityConfig = {
  high: { label: 'High', color: 'text-red-400', icon: '🔴' },
  medium: { label: 'Medium', color: 'text-yellow-400', icon: '🟡' },
  low: { label: 'Low', color: 'text-gray-400', icon: '⚪' },
};

const DiligenceRequestPanel: React.FC<DiligenceRequestPanelProps> = ({
  request,
  categories,
  subcategories,
  onClose
}) => {
  const [newComment, setNewComment] = useState('');
  
  const updateRequest = useUpdateDiligenceRequest();
  const { data: comments = [] } = useDiligenceComments(request?.id || '');
  const addComment = useAddDiligenceComment();
  
  if (!request) return null;
  
  const category = categories.find(c => c.id === request.category_id);
  const subcategory = subcategories.find(s => s.id === request.subcategory_id);
  const status = statusConfig[request.status];
  const priority = priorityConfig[request.priority];
  const StatusIcon = status.icon;
  
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
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    addComment.mutate({ 
      requestId: request.id, 
      content: newComment.trim() 
    });
    setNewComment('');
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
      <SheetContent className="w-[500px] bg-[#1A1F2E] border-l border-[#2A2F3A] p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b border-[#2A2F3A]">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="text-sm text-gray-400 mb-1">
                {category?.name}
                {subcategory && ` / ${subcategory.name}`}
              </div>
              <SheetTitle className="text-xl text-white">{request.title}</SheetTitle>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <Select value={request.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px] bg-[#0A0F0F] border-[#2A2F3A]">
                <Badge variant="outline" className={`${status.bg} ${status.color} border-0`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F2E] border-[#2A2F3A]">
                {Object.entries(statusConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3 h-3 ${config.color}`} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Select value={request.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="w-[120px] bg-[#0A0F0F] border-[#2A2F3A]">
                <span className={priority.color}>
                  {priority.icon} {priority.label}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F2E] border-[#2A2F3A]">
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={config.color}>
                      {config.icon} {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>
        
        <div className="p-6 space-y-6">
          {/* Description */}
          {request.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
              <p className="text-white bg-[#0A0F0F] rounded-lg p-4 text-sm">
                {request.description}
              </p>
            </div>
          )}
          
          {/* Documents */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents ({request.document_ids?.length || 0})
            </h3>
            {request.document_ids?.length > 0 ? (
              <div className="space-y-2">
                {/* Document list would go here */}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#2A2F3A] rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Drag & drop files or click to upload
                </p>
              </div>
            )}
          </div>
          
          {/* Assignee */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Assignee
            </h3>
            {request.assignee_id ? (
              <div className="flex items-center gap-3 bg-[#0A0F0F] rounded-lg p-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37]">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-white">Assigned User</span>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full border-[#2A2F3A] text-gray-400 hover:bg-[#2A2F3A]"
              >
                <User className="w-4 h-4 mr-2" />
                Assign Someone
              </Button>
            )}
          </div>
          
          {/* Due Date */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date
            </h3>
            <div className="bg-[#0A0F0F] rounded-lg p-3 text-white">
              {request.due_date 
                ? format(new Date(request.due_date), 'MMMM d, yyyy')
                : 'No due date set'
              }
            </div>
          </div>
          
          {/* Comments */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </h3>
            
            <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-[#0A0F0F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs">
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-400">
                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-white">{comment.content}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-[#0A0F0F] border-[#2A2F3A] text-white resize-none"
                rows={2}
              />
              <Button 
                size="icon"
                onClick={handleAddComment}
                disabled={!newComment.trim() || addComment.isPending}
                className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0A0F0F] shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-[#2A2F3A] bg-[#0A0F0F]">
          <div className="flex gap-3">
            {request.status !== 'completed' && (
              <Button 
                onClick={handleMarkComplete}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#2A2F3A] text-gray-300 hover:bg-[#2A2F3A]"
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
