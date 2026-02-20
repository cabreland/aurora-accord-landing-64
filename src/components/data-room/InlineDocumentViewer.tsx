import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Loader2,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataRoomDocument } from '@/hooks/useDataRoom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface InlineDocumentViewerProps {
  document: DataRoomDocument;
  onBack: () => void;
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
  approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export const InlineDocumentViewer: React.FC<InlineDocumentViewerProps> = ({
  document,
  onBack,
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    setSignedUrl(null);
    setBlobUrl(null);
    setIframeLoaded(false);
    setUrlError(null);

    const fetchAndPrepare = async () => {
      setIsLoadingUrl(true);
      try {
        // Get signed URL
        const { data, error } = await supabase.storage
          .from('data-room-documents')
          .createSignedUrl(document.file_path, 900);
        
        let url: string | null = null;
        if (error) {
          // Fallback to file_url
          if (document.file_url) {
            url = document.file_url;
          } else {
            throw error;
          }
        } else {
          url = data.signedUrl;
        }
        
        setSignedUrl(url);

        // For PDFs, fetch as blob to bypass CSP iframe restrictions
        const cat = getFileCategory(document.file_name, document.mime_type);
        if (cat === 'pdf' && url) {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Fetch failed');
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setBlobUrl(objectUrl);
          } catch (blobErr) {
            console.warn('Blob fetch failed, will try direct URL:', blobErr);
          }
        }
      } catch (err: any) {
        console.error('Failed to load document:', err);
        setUrlError('Could not load preview. The file may not be accessible.');
      } finally {
        setIsLoadingUrl(false);
      }
    };

    fetchAndPrepare();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [document.id, document.file_path, document.file_url]);

  const handleDownload = () => {
    if (signedUrl) {
      const link = window.document.createElement('a');
      link.href = signedUrl;
      link.download = document.file_name;
      link.click();
    }
  };

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
      const pdfSrc = blobUrl || signedUrl;
      return (
        <div className="relative h-full">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <iframe
            src={pdfSrc}
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
    <div className="flex flex-col min-w-0 w-full" style={{ height: '100%' }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
            <FileTypeIcon fileName={document.file_name} mimeType={document.mime_type} className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{document.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(document.file_size)} • Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {document.version && (
            <Badge variant="outline" className="text-xs">v{document.version}</Badge>
          )}
          {statusConfig && (
            <Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!signedUrl}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Body: Viewer + Comments Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Viewer */}
        <div className="flex-1 bg-muted/20 overflow-hidden">
          {renderPreview()}
        </div>

        {/* Comments Panel */}
        <div className="w-72 border-l border-border bg-card flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Comments</span>
            </div>
          </div>

          {/* Comment List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Be the first to add a comment</p>
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
                rows={2}
              />
            </div>
            <Button
              size="sm"
              className="w-full mt-2"
              disabled={!commentText.trim()}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Post Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
