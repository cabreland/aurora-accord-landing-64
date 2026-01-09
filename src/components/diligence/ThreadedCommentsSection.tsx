import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  MessageSquare, 
  Send, 
  Reply, 
  Pencil, 
  Trash2,
  Mail,
  CornerDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCompactTimestamp } from '@/lib/formatTimestamp';
import { 
  DiligenceComment,
  useDiligenceComments,
  useAddDiligenceComment,
  useApproveComment,
  useUnapproveComment,
  useUpdateComment,
  useDeleteComment,
  useSendToCustomer
} from '@/hooks/useDiligenceTracker';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarColor } from '@/components/common/UserAvatarBadge';
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
import { toast } from 'sonner';

interface ThreadedCommentsSectionProps {
  requestId: string;
}

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
  
  return profile.email?.[0]?.toUpperCase() || 'U';
};

interface SingleCommentProps {
  comment: DiligenceComment;
  requestId: string;
  currentUserId: string | undefined;
  isReply?: boolean;
  onReply: (commentId: string) => void;
}

const SingleComment: React.FC<SingleCommentProps> = ({ 
  comment, 
  requestId, 
  currentUserId,
  isReply = false,
  onReply
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const approveComment = useApproveComment();
  const unapproveComment = useUnapproveComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  
  const commentColor = getAvatarColor(comment.user_id);
  const isOwnComment = comment.user_id === currentUserId;
  const isApproved = comment.comment_type === 'approved';
  
  const handleApprove = () => {
    approveComment.mutate({ commentId: comment.id, requestId });
  };
  
  const handleUnapprove = () => {
    unapproveComment.mutate({ commentId: comment.id, requestId });
  };
  
  const handleEdit = () => {
    if (editContent.trim()) {
      updateComment.mutate({ 
        commentId: comment.id, 
        content: editContent.trim(), 
        requestId 
      });
      setIsEditing(false);
    }
  };
  
  const handleDelete = () => {
    deleteComment.mutate({ commentId: comment.id, requestId });
    setShowDeleteDialog(false);
  };
  
  return (
    <>
      <div className={`rounded-lg p-3 ${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} ${
        isApproved ? 'bg-white border border-green-300' : 'bg-gray-50'
      }`}>
        <div className="flex items-start gap-3">
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarFallback className={`${commentColor.bg} ${commentColor.text} text-xs font-medium`}>
              {getCommentAuthorInitials(comment.profile)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-gray-900">
                {getCommentAuthorName(comment.profile)}
              </span>
              {isApproved && (
                <Badge className="bg-green-600 text-white text-xs">
                  ✓ Approved
                </Badge>
              )}
              {comment.sent_to_customer && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  📧 Sent
                </Badge>
              )}
              {comment.is_from_customer && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                  👤 Customer
                </Badge>
              )}
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">
                {formatCompactTimestamp(comment.created_at)}
              </span>
              {comment.approved_at && comment.approver_profile && (
                <span className="text-xs text-gray-400">
                  · Approved by {getCommentAuthorName(comment.approver_profile)}
                </span>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-white border-gray-200 text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleEdit}
                    disabled={updateComment.isPending}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            )}
            
            {/* Actions */}
            {!isEditing && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {!isReply && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-7 text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => onReply(comment.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
                
                {isApproved ? (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-7 text-xs text-gray-500 hover:text-orange-600"
                    onClick={handleUnapprove}
                    disabled={unapproveComment.isPending}
                  >
                    Unapprove
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-7 text-xs text-green-600 hover:text-green-700"
                    onClick={handleApprove}
                    disabled={approveComment.isPending}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approve as Answer
                  </Button>
                )}
                
                {isOwnComment && (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-7 text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-7 text-xs text-gray-500 hover:text-red-600"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            )}
            
            {/* Threaded Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-2">
                {comment.replies.map(reply => (
                  <SingleComment
                    key={reply.id}
                    comment={reply}
                    requestId={requestId}
                    currentUserId={currentUserId}
                    isReply={true}
                    onReply={onReply}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const ThreadedCommentsSection: React.FC<ThreadedCommentsSectionProps> = ({ requestId }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const { data: comments = [], isLoading } = useDiligenceComments(requestId);
  const addComment = useAddDiligenceComment();
  const sendToCustomer = useSendToCustomer();
  
  // Separate approved and internal comments
  const { approvedComments, internalComments } = useMemo(() => {
    const approved: DiligenceComment[] = [];
    const internal: DiligenceComment[] = [];
    
    comments.forEach(comment => {
      if (comment.comment_type === 'approved') {
        approved.push(comment);
      } else {
        internal.push(comment);
      }
    });
    
    return { approvedComments: approved, internalComments: internal };
  }, [comments]);
  
  const handlePostComment = (approveImmediately: boolean = false) => {
    if (!newComment.trim()) return;
    
    addComment.mutate({
      requestId,
      content: newComment.trim(),
      commentType: 'internal',
      approveImmediately
    });
    
    setNewComment('');
  };
  
  const handlePostReply = (parentCommentId: string) => {
    if (!replyContent.trim()) return;
    
    addComment.mutate({
      requestId,
      content: replyContent.trim(),
      commentType: 'internal',
      parentCommentId
    });
    
    setReplyContent('');
    setReplyingTo(null);
  };
  
  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };
  
  const handleSendToCustomer = (commentId: string) => {
    sendToCustomer.mutate({ commentId, requestId });
    toast.success('Response marked as sent to customer');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* APPROVED ANSWERS SECTION */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-900">
            Approved Answer (Ready for Customer)
          </h3>
        </div>
        
        {approvedComments.length === 0 ? (
          <p className="text-sm text-green-700 italic">
            No approved answer yet. Mark a comment below to approve it as the official response.
          </p>
        ) : (
          <div className="space-y-3">
            {approvedComments.map(comment => (
              <div key={comment.id}>
                <SingleComment
                  comment={comment}
                  requestId={requestId}
                  currentUserId={user?.id}
                  onReply={handleReply}
                />
                {/* Send to Customer Action */}
                <div className="mt-2 flex items-center justify-between">
                  {comment.sent_to_customer ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Mail className="w-4 h-4" />
                      <span>
                        Sent to customer {comment.sent_to_customer_at ? formatCompactTimestamp(comment.sent_to_customer_at) : ''}
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}
                  {!comment.sent_to_customer && (
                    <Button 
                      size="sm" 
                      onClick={() => handleSendToCustomer(comment.id)}
                      disabled={sendToCustomer.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send to Customer
                    </Button>
                  )}
                  {comment.sent_to_customer && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      📧 Sent
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INTERNAL DISCUSSION SECTION */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Internal Discussion</h3>
          <Badge variant="secondary" className="text-xs">Team Only</Badge>
        </div>

        {/* Thread of Comments */}
        <div className="space-y-3 mb-4">
          {internalComments.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No internal discussion yet. Start the conversation!
            </div>
          ) : (
            internalComments.map(comment => (
              <div key={comment.id}>
                <SingleComment
                  comment={comment}
                  requestId={requestId}
                  currentUserId={user?.id}
                  onReply={handleReply}
                />
                
                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="ml-8 mt-2 border-l-2 border-blue-200 pl-4">
                    <div className="flex items-center gap-2 mb-2 text-xs text-blue-600">
                      <CornerDownRight className="w-3 h-3" />
                      Replying to {getCommentAuthorName(comment.profile)}
                    </div>
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      className="bg-white border-gray-200 text-sm mb-2"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handlePostReply(comment.id)}
                        disabled={!replyContent.trim() || addComment.isPending}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Post Reply
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Comment Input */}
        <div className="border-t border-gray-200 pt-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add internal comment or question..."
            rows={3}
            className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none mb-2"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              onClick={() => handlePostComment(false)}
              disabled={!newComment.trim() || addComment.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Post Comment
            </Button>
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handlePostComment(true)}
              disabled={!newComment.trim() || addComment.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Post & Approve as Answer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadedCommentsSection;