import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Eye, 
  FileText, 
  Image, 
  File, 
  X,
  ExternalLink,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  tag: string;
  created_at: string;
  uploaded_by: string;
  version: number;
}

interface DocumentPreviewProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  canDownload?: boolean;
}

const DocumentPreview = ({ document, isOpen, onClose, canDownload = true }: DocumentPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="w-5 h-5" />;
    
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const canPreview = (fileType: string | null) => {
    if (!fileType) return false;
    return fileType.startsWith('image/') || fileType.includes('pdf');
  };

  const handlePreview = async () => {
    if (!canPreview(document.file_type)) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (error) throw error;
      setPreviewUrl(data.signedUrl);
    } catch (error) {
      console.error('Error creating preview URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!canDownload) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'cim': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'nda': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'financials': 'bg-green-500/20 text-green-400 border-green-500/30',
      'buyer_notes': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'legal': 'bg-red-500/20 text-red-400 border-red-500/30',
      'due_diligence': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'other': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[tag] || colors.other;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-background border-[#D4AF37]/30">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground flex items-center gap-2">
              {getFileIcon(document.file_type)}
              {document.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Document Info Sidebar */}
          <div className="lg:w-1/3 space-y-4">
            <Card className="bg-card border-[#D4AF37]/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className={getTagColor(document.tag)}>
                    {document.tag.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Uploaded {formatDate(document.created_at)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Version {document.version}</span>
                </div>

                {document.file_size && (
                  <div className="text-sm text-muted-foreground">
                    Size: {formatFileSize(document.file_size)}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Type: {document.file_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
                </div>

                <div className="flex gap-2 pt-3">
                  {canPreview(document.file_type) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePreview}
                      disabled={isLoading}
                      className="flex-1 border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {isLoading ? 'Loading...' : 'Preview'}
                    </Button>
                  )}
                  
                  {canDownload && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownload}
                      className="flex-1 border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Area */}
          <div className="lg:w-2/3 flex-1">
            {previewUrl ? (
              <div className="h-full border border-[#D4AF37]/20 rounded-lg overflow-hidden">
                {document.file_type?.startsWith('image/') ? (
                  <img 
                    src={previewUrl} 
                    alt={document.name}
                    className="w-full h-full object-contain bg-background"
                  />
                ) : document.file_type?.includes('pdf') ? (
                  <iframe 
                    src={previewUrl}
                    className="w-full h-full"
                    title={document.name}
                  />
                ) : null}
              </div>
            ) : (
              <div className="h-full border border-[#D4AF37]/20 rounded-lg flex items-center justify-center bg-muted/10">
                <div className="text-center space-y-4">
                  {getFileIcon(document.file_type)}
                  <div>
                    <p className="text-lg font-medium text-foreground">{document.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {canPreview(document.file_type) 
                        ? 'Click Preview to view this file' 
                        : 'Preview not available for this file type'
                      }
                    </p>
                  </div>
                  {canPreview(document.file_type) && (
                    <Button onClick={handlePreview} disabled={isLoading}>
                      <Eye className="w-4 h-4 mr-2" />
                      {isLoading ? 'Loading...' : 'Preview File'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreview;