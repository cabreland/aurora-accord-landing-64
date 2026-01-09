import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  Clock, 
  User,
  HardDrive,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { AccessLevel } from '@/hooks/useCompanyNDA';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  confidentiality_level: AccessLevel;
  uploaded_by?: string;
}

interface FileListViewProps {
  folderName: string;
  documents: Document[];
  onBack: () => void;
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

export const FileListView: React.FC<FileListViewProps> = ({
  folderName,
  documents,
  onBack
}) => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (doc: Document) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download documents",
        variant: "destructive"
      });
      return;
    }

    setDownloading(doc.id);
    
    try {
      // Check access using RPC
      const { data: canAccess, error: accessError } = await supabase.rpc('can_access_document', {
        p_user_id: user.id,
        p_document_id: doc.id
      });

      if (accessError) throw accessError;

      if (!canAccess) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to download this document",
          variant: "destructive"
        });
        return;
      }

      // Log the download
      await supabase.from('document_views').insert({
        document_id: doc.id,
        user_id: user.id,
        action: 'download',
        user_agent: navigator.userAgent
      });

      // Generate signed URL
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: `Downloading ${doc.name}`
        });
      }
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleView = async (doc: Document) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view documents",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check access
      const { data: canAccess, error: accessError } = await supabase.rpc('can_access_document', {
        p_user_id: user.id,
        p_document_id: doc.id
      });

      if (accessError) throw accessError;

      if (!canAccess) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this document",
          variant: "destructive"
        });
        return;
      }

      // Log the view
      await supabase.from('document_views').insert({
        document_id: doc.id,
        user_id: user.id,
        action: 'view',
        user_agent: navigator.userAgent
      });

      // Generate signed URL
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Error viewing document:', error);
      toast({
        title: "View Failed",
        description: error.message || "Failed to view document",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAll = async () => {
    toast({
      title: "Downloading Files",
      description: "Your files are being prepared for download"
    });

    // Download each file sequentially
    for (const doc of documents) {
      await handleDownload(doc);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Data Room
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">{folderName}</span>
      </div>

      {/* Folder Info Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              {folderName}
            </CardTitle>
            <Button 
              onClick={handleDownloadAll}
              className="gap-2"
              disabled={documents.length === 0}
            >
              <Package className="w-4 h-4" />
              Download All as ZIP
            </Button>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {documents.length} files
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-4 h-4" />
              {formatFileSize(totalSize)} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No files in this folder</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(doc.file_size)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{doc.uploaded_by || 'Broker'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleView(doc)}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDownload(doc)}
                          disabled={downloading === doc.id}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
