import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  tag: string;
  confidentiality_level: string;
  created_at: string;
}

interface DocumentListManagementProps {
  dealId: string;
  refreshTrigger?: number;
}

export const DocumentListManagement = ({ dealId, refreshTrigger }: DocumentListManagementProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [dealId, refreshTrigger]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('deal-documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue anyway - the file might not exist
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast.success('Document deleted');
      loadDocuments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const getCategoryBadge = (tag: string) => {
    const colors: Record<string, string> = {
      pitch: 'bg-blue-500',
      cim: 'bg-purple-500',
      financial: 'bg-green-500',
      legal: 'bg-orange-500',
      other: 'bg-gray-500'
    };
    const labels: Record<string, string> = {
      pitch: 'Pitch Deck',
      cim: 'CIM',
      financial: 'Financial',
      legal: 'Legal',
      other: 'Other'
    };
    return (
      <Badge className={colors[tag] || 'bg-gray-500'}>
        {labels[tag] || tag}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 B';
    const k = 1024;
    if (bytes < k) return bytes + ' B';
    if (bytes < k * k) return (bytes / k).toFixed(1) + ' KB';
    return (bytes / (k * k)).toFixed(1) + ' MB';
  };

  // Group by category
  const groupedDocs: Record<string, Document[]> = {
    pitch: documents.filter(d => d.tag === 'pitch'),
    cim: documents.filter(d => d.tag === 'cim'),
    financial: documents.filter(d => d.tag === 'financial'),
    legal: documents.filter(d => d.tag === 'legal'),
    other: documents.filter(d => !['pitch', 'cim', 'financial', 'legal'].includes(d.tag))
  };

  const categoryTitles: Record<string, string> = {
    pitch: 'Pitch Deck',
    cim: 'Confidential Information Memorandum',
    financial: 'Financial Documents',
    legal: 'Legal Documents',
    other: 'Other Documents'
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Loading documents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {(['pitch', 'cim', 'financial', 'legal', 'other'] as const).map(category => {
        const docs = groupedDocs[category];
        if (docs.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {categoryTitles[category]}
                </CardTitle>
                <Badge variant="outline">{docs.length} files</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {docs.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(doc.file_size)} • 
                          {format(new Date(doc.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getCategoryBadge(doc.tag)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocument(doc)}
                      className="ml-2 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {documents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No documents uploaded yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
