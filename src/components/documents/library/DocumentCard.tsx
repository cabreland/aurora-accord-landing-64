import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { downloadDocument } from '@/lib/rpc/documentAccess';
import { 
  Eye, 
  Download, 
  MoreVertical, 
  Link2, 
  Share2, 
  Building2, 
  Clock,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    file_size: number | null;
    file_type: string | null;
    created_at: string;
    tag: string;
    deal_id: string;
    deals?: { company_name: string; industry?: string } | null;
  };
  onPreview?: (documentId: string) => void;
}

function getFileIcon(fileType: string | null): string {
  if (!fileType) return '📄';
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '📄';
  if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xls')) return '📊';
  if (type.includes('word') || type.includes('doc')) return '📝';
  if (type.includes('powerpoint') || type.includes('presentation') || type.includes('ppt')) return '📑';
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return '🖼️';
  if (type.includes('zip') || type.includes('archive')) return '📦';
  return '📄';
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryLabel(tag: string): string {
  const labels: Record<string, string> = {
    'cim': 'CIM',
    'financials': 'Financials',
    'legal': 'Legal',
    'pitch': 'Pitch Deck',
    'operations': 'Operations',
    'other': 'Other'
  };
  return labels[tag] || tag;
}

export function DocumentCard({ document, onPreview }: DocumentCardProps) {
  const { toast } = useToast();
  const fileIcon = getFileIcon(document.file_type);
  
  const handleDownload = async () => {
    const result = await downloadDocument(document.id);
    if (!result.success) {
      toast({
        title: "Download Failed",
        description: result.message || "Unable to download document",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/documents?doc=${document.id}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Document link copied to clipboard"
    });
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* File Icon */}
        <div className="text-4xl flex-shrink-0">{fileIcon}</div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate mb-1">
            {document.name}
          </h3>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {document.deals?.company_name && (
                <>
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{document.deals.company_name}</span>
                  <span>•</span>
                </>
              )}
              <span className="px-2 py-0.5 bg-muted rounded text-xs">
                {getCategoryLabel(document.tag)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
              </span>
              <span>•</span>
              <span>{formatFileSize(document.file_size)}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview?.(document.id)}
            className="hidden sm:flex"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview?.(document.id)} className="sm:hidden">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="sm:hidden">
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Link2 className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
