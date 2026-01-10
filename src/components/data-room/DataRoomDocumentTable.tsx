import React, { useState } from 'react';
import {
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  MoreVertical,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DataRoomDocument, DataRoomFolder } from '@/hooks/useDataRoom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DataRoomDocumentTableProps {
  documents: DataRoomDocument[];
  folders: DataRoomFolder[];
  selectedDocuments: Set<string>;
  onSelectDocument: (docId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDelete: (documentId: string) => Promise<boolean>;
  onUpdateStatus: (
    documentId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => Promise<boolean>;
  canApprove?: boolean;
  canDelete?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  pending_review: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

const FILE_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  pdf: { icon: FileText, color: 'text-destructive' },
  doc: { icon: File, color: 'text-primary' },
  docx: { icon: File, color: 'text-primary' },
  xls: { icon: FileSpreadsheet, color: 'text-success' },
  xlsx: { icon: FileSpreadsheet, color: 'text-success' },
  csv: { icon: FileSpreadsheet, color: 'text-success' },
  png: { icon: FileImage, color: 'text-info' },
  jpg: { icon: FileImage, color: 'text-info' },
  jpeg: { icon: FileImage, color: 'text-info' },
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileType: string | null) => {
  const type = fileType?.toLowerCase() || '';
  const config = FILE_ICONS[type] || { icon: FileText, color: 'text-muted-foreground' };
  return config;
};

export const DataRoomDocumentTable: React.FC<DataRoomDocumentTableProps> = ({
  documents,
  folders,
  selectedDocuments,
  onSelectDocument,
  onSelectAll,
  onDelete,
  onUpdateStatus,
  canApprove = true,
  canDelete = true,
}) => {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const allSelected = documents.length > 0 && selectedDocuments.size === documents.length;
  const someSelected = selectedDocuments.size > 0 && selectedDocuments.size < documents.length;

  const handleDownload = async (document: DataRoomDocument) => {
    setDownloadingId(document.id);
    try {
      const { data, error } = await supabase.storage
        .from('data-room-documents')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;

      // Create download link
      const link = window.document.createElement('a');
      link.href = data.signedUrl;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      toast.success(`Downloading ${document.file_name}`);
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingDocId) return;
    setIsSubmitting(true);
    try {
      await onUpdateStatus(rejectingDocId, 'rejected', rejectionReason);
      setRejectDialogOpen(false);
      setRejectingDocId(null);
      setRejectionReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return 'Unassigned';
    const folder = folders.find((f) => f.id === folderId);
    return folder ? `${folder.index_number} ${folder.name}` : 'Unknown';
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  // @ts-expect-error indeterminate is valid for DOM checkbox
                  indeterminate={someSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending_review;
              const StatusIcon = statusConfig.icon;
              const fileIconConfig = getFileIcon(doc.file_type);
              const FileIcon = fileIconConfig.icon;
              const isSelected = selectedDocuments.has(doc.id);

              return (
                <TableRow
                  key={doc.id}
                  className={cn(
                    'transition-colors duration-150',
                    isSelected && 'bg-primary/5'
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectDocument(doc.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileIcon className={cn('h-5 w-5', fileIconConfig.color)} />
                      <div>
                        <div className="font-medium text-foreground">{doc.file_name}</div>
                        {doc.index_number && (
                          <div className="text-xs text-muted-foreground">
                            {doc.index_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('gap-1', statusConfig.className)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatFileSize(doc.file_size)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {doc.uploaded_by?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                        {doc.uploaded_by?.slice(0, 8) || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {downloadingId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        {canApprove && (
                          <>
                            <DropdownMenuSeparator />
                            {doc.status !== 'approved' && (
                              <DropdownMenuItem onClick={() => onUpdateStatus(doc.id, 'approved')}>
                                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {doc.status !== 'rejected' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setRejectingDocId(doc.id);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                Reject
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. This will be sent to the uploader.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Document'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
