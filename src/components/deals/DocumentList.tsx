import React from 'react';
import { FileText, Download, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { AccessLevel } from '@/hooks/useCompanyNDA';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  confidentiality_level: AccessLevel;
}

interface DocumentListProps {
  documents: Document[];
  accessLevel: AccessLevel;
  requiredLevel: AccessLevel;
  onRequestAccess: () => void;
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown size';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  accessLevel,
  requiredLevel,
  onRequestAccess
}) => {
  const { user } = useAuth();
  
  const hasAccess = (): boolean => {
    const hierarchy: AccessLevel[] = ['public', 'teaser', 'cim', 'financials', 'full'];
    return hierarchy.indexOf(accessLevel) >= hierarchy.indexOf(requiredLevel);
  };

  const handleDownload = async (doc: Document) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download documents",
        variant: "destructive"
      });
      return;
    }

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
          description: "Your document is being downloaded"
        });
      }
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document",
        variant: "destructive"
      });
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

  if (!hasAccess()) {
    return (
      <div className="text-center py-8 px-4 bg-muted/50 rounded-lg border">
        <Lock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium mb-2">
          {requiredLevel.charAt(0).toUpperCase() + requiredLevel.slice(1)} Access Required
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Request higher access to view these documents
        </p>
        <Button size="sm" onClick={onRequestAccess}>
          Request Access
        </Button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 px-4 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No documents in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="h-10 w-10 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{doc.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(doc.file_size)} • Uploaded{' '}
                {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => handleView(doc)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" onClick={() => handleDownload(doc)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
