import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  File,
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FolderOpen,
  Loader2,
  ExternalLink,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DataRoomDocument, DataRoomFolder } from '@/hooks/useDataRoom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DataRoomDocument | null;
  folder?: DataRoomFolder | null;
  onApprove: () => Promise<boolean>;
  onReject: (reason: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  approved: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: CheckCircle,
    label: 'Approved',
  },
  pending_review: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock,
    label: 'Pending Review',
  },
  rejected: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
    label: 'Rejected',
  },
};

function getFileIcon(fileType: string | null): React.ElementType {
  if (!fileType) return FileText;
  const type = fileType.toLowerCase();
  if (type.includes('pdf') || type.includes('doc') || type.includes('word')) return FileText;
  if (type.includes('xls') || type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) return FileSpreadsheet;
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return FileImage;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPreviewable(fileType: string | null): boolean {
  if (!fileType) return false;
  const type = fileType.toLowerCase();
  return type.includes('pdf') || type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg');
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  open,
  onOpenChange,
  document,
  folder,
  onApprove,
  onReject,
  onDelete,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!document) return null;

  const status = statusConfig[document.status] || statusConfig.pending_review;
  const StatusIcon = status.icon;
  const FileIcon = getFileIcon(document.file_type);
  const canPreview = isPreviewable(document.file_type);

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('data-room-documents')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      toast.error('Failed to download document');
    }
  };

  const handlePreview = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('data-room-documents')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      toast.error('Failed to preview document');
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      const success = await onReject(rejectionReason.trim());
      if (success) {
        setRejectionReason('');
        setShowRejectForm(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const success = await onDelete();
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <FileIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg truncate">{document.file_name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {document.index_number && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {document.index_number}
                  </Badge>
                )}
                <Badge className={cn(status.color)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">File Type</span>
              <p className="text-sm font-medium uppercase">{document.file_type || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">File Size</span>
              <p className="text-sm font-medium">{formatFileSize(document.file_size)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Uploaded</span>
              <p className="text-sm font-medium">{format(new Date(document.created_at), 'PPpp')}</p>
            </div>
            {folder && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Folder</span>
                <p className="text-sm font-medium flex items-center gap-1">
                  <FolderOpen className="h-4 w-4" />
                  {folder.name}
                </p>
              </div>
            )}
          </div>

          {/* Approval info if approved */}
          {document.status === 'approved' && document.approved_at && (
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Approved</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(document.approved_at), 'PPpp')}
              </p>
            </div>
          )}

          {/* Rejection reason if rejected */}
          {document.status === 'rejected' && document.rejection_reason && (
            <div className="bg-destructive/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Rejected</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {document.rejection_reason}
              </p>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="space-y-3">
              <Textarea
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="flex-1"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Rejection
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t bg-muted/20">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Preview/Download */}
            <div className="flex gap-2 flex-1">
              {canPreview && (
                <Button variant="outline" onClick={handlePreview}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Status Actions */}
            {document.status === 'pending_review' && !showRejectForm && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectForm(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
