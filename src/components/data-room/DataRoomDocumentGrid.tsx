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
} from 'lucide-react';
import { DocumentViewerModal } from './DocumentViewerModal';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataRoomDocument, DataRoomFolder } from '@/hooks/useDataRoom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DataRoomDocumentGridProps {
  documents: DataRoomDocument[];
  folders: DataRoomFolder[];
  selectedDocuments: Set<string>;
  onSelectDocument: (docId: string, selected: boolean) => void;
  onDelete: (documentId: string) => Promise<boolean>;
  onUpdateStatus: (
    documentId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => Promise<boolean>;
  onViewDocument?: (documentId: string) => void;
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

const FILE_ICONS: Record<string, { icon: typeof FileText; color: string; bgColor: string }> = {
  pdf: { icon: FileText, color: 'text-red-600', bgColor: 'bg-red-50' },
  doc: { icon: File, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  docx: { icon: File, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  xls: { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50' },
  xlsx: { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50' },
  csv: { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50' },
  png: { icon: FileImage, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  jpg: { icon: FileImage, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  jpeg: { icon: FileImage, color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileType: string | null) => {
  const type = fileType?.toLowerCase() || '';
  return FILE_ICONS[type] || { icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted' };
};

export const DataRoomDocumentGrid: React.FC<DataRoomDocumentGridProps> = ({
  documents,
  folders,
  selectedDocuments,
  onSelectDocument,
  onDelete,
  onUpdateStatus,
  onViewDocument,
}) => {
  const [viewingDoc, setViewingDoc] = useState<DataRoomDocument | null>(null);
  const handleDownload = async (document: DataRoomDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('data-room-documents')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;

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
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map((doc) => {
          const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending_review;
          const StatusIcon = statusConfig.icon;
          const fileIconConfig = getFileIcon(doc.file_type);
          const FileIcon = fileIconConfig.icon;
          const isSelected = selectedDocuments.has(doc.id);

          return (
            <div
              key={doc.id}
              className={cn(
                'bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30 group',
                isSelected && 'ring-2 ring-primary border-primary'
              )}
            >
              {/* File Preview Area — click icon to open viewer */}
              <div
                className={cn('relative h-32 flex items-center justify-center cursor-pointer', fileIconConfig.bgColor)}
                onClick={() => onViewDocument ? onViewDocument(doc.id) : setViewingDoc(doc)}
              >
                <FileIcon className={cn('h-12 w-12', fileIconConfig.color)} />

                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectDocument(doc.id, !!checked)}
                    className="bg-background"
                  />
                </div>

                {/* Actions Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewDocument ? onViewDocument(doc.id) : setViewingDoc(doc)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {doc.status !== 'approved' && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(doc.id, 'approved')}>
                          <CheckCircle className="h-4 w-4 mr-2 text-success" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {doc.status !== 'rejected' && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(doc.id, 'rejected')}>
                          <XCircle className="h-4 w-4 mr-2 text-destructive" />
                          Reject
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-2 right-2">
                  <Badge variant="outline" className={cn('gap-1 text-xs', statusConfig.className)}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <h4
                  className="font-medium text-sm text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  title={doc.file_name}
                  onClick={() => onViewDocument ? onViewDocument(doc.id) : setViewingDoc(doc)}
                >
                  {doc.file_name}
                </h4>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {viewingDoc && (
        <DocumentViewerModal
          document={viewingDoc}
          open={!!viewingDoc}
          onOpenChange={(open) => !open && setViewingDoc(null)}
        />
      )}
    </>
  );
};
