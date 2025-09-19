import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

interface SimpleDocumentListProps {
  dealId?: string;
}

const SimpleDocumentList: React.FC<SimpleDocumentListProps> = ({ dealId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [dealId]);

  const fetchDocuments = async () => {
    try {
      let query = supabase
        .from('documents')
        .select('id, name, file_path, file_type, created_at');

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      // Generate signed URL
      const { data: signedUrl, error } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(document.file_path, 300);

      if (error) throw error;

      // Download the file
      const response = await fetch(signedUrl.signedUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${document.name} downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  if (documents.length === 0) {
    return <div>No documents found</div>;
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{document.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {document.file_type} • {new Date(document.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(document)}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SimpleDocumentList;