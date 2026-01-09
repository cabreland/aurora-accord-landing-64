import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  MoreVertical,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataRoomDocument, DataRoomFolder } from '@/hooks/useDataRoom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataRoomContentProps {
  documents: DataRoomDocument[];
  folders: DataRoomFolder[];
  selectedFolderId: string | null;
  currentLocation: string;
  onUpload: (file: File) => Promise<unknown>;
  onDelete: (documentId: string) => Promise<boolean>;
  onUpdateStatus: (
    documentId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => Promise<boolean>;
}

const STATUS_CONFIG = {
  pending_review: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export const DataRoomContent: React.FC<DataRoomContentProps> = ({
  documents,
  folders,
  selectedFolderId,
  currentLocation,
  onUpload,
  onDelete,
  onUpdateStatus,
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      for (const file of acceptedFiles) {
        await onUpload(file);
      }
      setUploading(false);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleDownload = async (document: DataRoomDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('data-room-documents')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      await onDelete(documentToDelete);
      setDocumentToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return 'Unassigned';
    const folder = folders.find((f) => f.id === folderId);
    return folder ? `${folder.index_number} ${folder.name}` : 'Unknown';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          {uploading
            ? 'Uploading...'
            : isDragActive
            ? 'Drop files here'
            : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Uploading to: {currentLocation}
        </p>
      </div>

      {/* Documents Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No documents in this location
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => {
                const statusConfig = STATUS_CONFIG[doc.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-foreground">{doc.file_name}</div>
                          {doc.index_number && (
                            <div className="text-xs text-muted-foreground">
                              Index: {doc.index_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getFolderName(doc.folder_id)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(doc.file_size)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
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
                          <DropdownMenuSeparator />
                          {doc.status !== 'approved' && (
                            <DropdownMenuItem
                              onClick={() => onUpdateStatus(doc.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {doc.status !== 'rejected' && (
                            <DropdownMenuItem
                              onClick={() => onUpdateStatus(doc.id, 'rejected', 'Rejected by admin')}
                            >
                              <XCircle className="h-4 w-4 mr-2 text-red-500" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDocumentToDelete(doc.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
