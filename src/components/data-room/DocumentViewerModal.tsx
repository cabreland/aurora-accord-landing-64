import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  File,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataRoomDocument } from '@/hooks/useDataRoom';
import { formatDistanceToNow } from 'date-fns';

interface DocumentViewerModalProps {
  document: DataRoomDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getFileCategory(fileName: string, mimeType?: string | null): 'pdf' | 'office' | 'image' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mime = mimeType?.toLowerCase() || '';

  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt'].includes(ext)) return 'office';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mime.startsWith('image/')) return 'image';
  return 'other';
}

function FileTypeIcon({ fileName, mimeType, className = 'h-5 w-5' }: { fileName: string; mimeType?: string | null; className?: string }) {
  const cat = getFileCategory(fileName, mimeType);
  if (cat === 'pdf') return <FileText className={className} />;
  if (cat === 'office') return <FileSpreadsheet className={className} />;
  if (cat === 'image') return <FileImage className={className} />;
  return <File className={className} />;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending_review: { label: 'Pending Review', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  open,
  onOpenChange,
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !document) {
      setSignedUrl(null);
      setIframeLoaded(false);
      setUrlError(null);
      return;
    }

    const fetchSignedUrl = async () => {
      setIsLoadingUrl(true);
      setUrlError(null);
      try {
        const { data, error } = await supabase.storage
          .from('data-room-documents')
          .createSignedUrl(document.file_path, 900); // 15-minute URL

        if (error) throw error;
        setSignedUrl(data.signedUrl);
      } catch (err: any) {
        console.error('Failed to generate signed URL:', err);
        setUrlError('Could not load preview. The file may not be accessible.');
      } finally {
        setIsLoadingUrl(false);
      }
    };

    fetchSignedUrl();
  }, [open, document]);

  const handleDownload = () => {
    if (signedUrl) {
      const link = window.document.createElement('a');
      link.href = signedUrl;
      link.download = document?.file_name || 'download';
      link.click();
    }
  };

  if (!document) return null;

  const category = getFileCategory(document.file_name, document.mime_type);
  const statusConfig = STATUS_CONFIG[document.status || 'pending_review'];

  const renderPreview = () => {
    if (isLoadingUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading preview...</p>
        </div>
      );
    }

    if (urlError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-center">{urlError}</p>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!signedUrl}>
            <Download className="h-4 w-4 mr-2" />
            Download Instead
          </Button>
        </div>
      );
    }

    if (!signedUrl) return null;

    if (category === 'image') {
      return (
        <div className="flex items-center justify-center h-full p-4 bg-muted/20">
          <img
            src={signedUrl}
            alt={document.file_name}
            className="max-h-full max-w-full object-contain rounded"
          />
        </div>
      );
    }

    if (category === 'pdf') {
      return (
        <div className="relative h-full">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <iframe
            src={signedUrl}
            className="w-full h-full border-0"
            title={document.file_name}
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      );
    }

    if (category === 'office') {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(signedUrl)}&embedded=true`;
      return (
        <div className="relative h-full">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title={document.file_name}
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <File className="h-16 w-16 opacity-40" />
        <div className="text-center">
          <p className="font-medium text-foreground">Preview not available</p>
          <p className="text-sm mt-1">Download the file to view its contents</p>
        </div>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
              <FileTypeIcon fileName={document.file_name} mimeType={document.mime_type} className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold truncate" title={document.file_name}>
                {document.file_name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground capitalize">
                {category === 'office' ? 'Office Document' : category.charAt(0).toUpperCase() + category.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {statusConfig && (
              <Badge variant="outline" className={`text-xs ${statusConfig.className}`}>
                {statusConfig.label}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!signedUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {renderPreview()}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-4">
            <span>{formatFileSize(document.file_size)}</span>
            {document.created_at && (
              <span>Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}</span>
            )}
          </div>
          {document.index_number && (
            <span className="font-mono text-xs">#{document.index_number}</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
