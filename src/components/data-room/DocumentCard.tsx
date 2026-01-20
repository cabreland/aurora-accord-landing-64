import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  File, 
  Calendar, 
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { DataRoomDocument, DataRoomFolder } from '@/hooks/useDataRoom';

interface DocumentCardProps {
  document: DataRoomDocument;
  folder?: DataRoomFolder | null;
  onClick: () => void;
}

// Category colors for left border
const categoryColors: Record<string, string> = {
  'Corporate & Legal': 'border-purple-500',
  'Financials': 'border-emerald-500',
  'Operations': 'border-blue-500',
  'Client Base & Contracts': 'border-pink-500',
  'Services & Deliverables': 'border-cyan-500',
  'Marketing & Sales': 'border-orange-500',
  'Revenue & Performance': 'border-green-500',
  'Technology & Integrations': 'border-indigo-500',
  'Debt Documents': 'border-red-500',
  'Miscellaneous': 'border-slate-500',
};

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  approved: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: CheckCircle,
    label: 'Approved',
  },
  pending_review: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock,
    label: 'Pending',
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

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, folder, onClick }) => {
  const status = statusConfig[document.status] || statusConfig.pending_review;
  const StatusIcon = status.icon;
  const FileIcon = getFileIcon(document.file_type);
  
  // Get category name from folder's category
  const categoryName = folder?.category?.name || 'Miscellaneous';
  const borderColor = categoryColors[categoryName] || 'border-slate-500';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50 border-l-4',
        borderColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-muted">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{document.file_name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {document.index_number && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {document.index_number}
                  </Badge>
                )}
                {folder && (
                  <span className="text-xs text-muted-foreground truncate">
                    {folder.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge className={cn('shrink-0', status.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Rejection reason if rejected */}
        {document.status === 'rejected' && document.rejection_reason && (
          <p className="text-sm text-destructive line-clamp-2 mb-3 bg-destructive/10 p-2 rounded">
            {document.rejection_reason}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="uppercase text-xs">{document.file_type || 'File'}</span>
            </div>
            <span>{formatFileSize(document.file_size)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span title={format(new Date(document.created_at), 'PPpp')}>
                {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
