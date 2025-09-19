import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { downloadDocument } from '@/lib/rpc/documentAccess';

export interface ExportProgress {
  current: number;
  total: number;
  status: 'preparing' | 'downloading' | 'complete' | 'error';
  message: string;
}

interface UseDocumentExportOptions {
  dealId?: string;
}

export const useDocumentExport = ({ dealId }: UseDocumentExportOptions = {}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const { toast } = useToast();

  const exportAllDocuments = async () => {
    try {
      setIsExporting(true);
      setProgress({
        current: 0,
        total: 0,
        status: 'preparing',
        message: 'Preparing document export...'
      });

      // Fetch documents
      let query = supabase
        .from('documents')
        .select('id, name, file_path, file_type, deal_id');

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data: documents, error } = await query.order('name');

      if (error) throw error;

      if (!documents || documents.length === 0) {
        toast({
          title: "No Documents",
          description: "No documents found to export",
          variant: "default"
        });
        return;
      }

      setProgress({
        current: 0,
        total: documents.length,
        status: 'downloading',
        message: `Downloading ${documents.length} documents...`
      });

      // Download all documents sequentially
      let successCount = 0;
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        
        setProgress({
          current: i + 1,
          total: documents.length,
          status: 'downloading',
          message: `Downloading ${doc.name}...`
        });

        const result = await downloadDocument(doc.id);
        if (result.success) {
          successCount++;
        }

        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setProgress({
        current: documents.length,
        total: documents.length,
        status: 'complete',
        message: `Export complete! ${successCount}/${documents.length} documents downloaded.`
      });

      toast({
        title: "Export Complete",
        description: `Successfully downloaded ${successCount} of ${documents.length} documents`,
        variant: successCount === documents.length ? "default" : "destructive"
      });

      // Clear progress after 3 seconds
      setTimeout(() => setProgress(null), 3000);

    } catch (error) {
      console.error('Error exporting documents:', error);
      setProgress({
        current: 0,
        total: 0,
        status: 'error',
        message: 'Export failed'
      });
      
      toast({
        title: "Export Failed",
        description: "Failed to export documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const previewAllDocuments = async () => {
    try {
      let query = supabase
        .from('documents')
        .select('id, name, file_type, created_at, tag, deal_id');

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data: documents, error } = await query.order('name');

      if (error) throw error;

      if (!documents || documents.length === 0) {
        toast({
          title: "No Documents",
          description: "No documents found to preview",
          variant: "default"
        });
        return [];
      }

      return documents;
    } catch (error) {
      console.error('Error fetching documents for preview:', error);
      toast({
        title: "Preview Failed",
        description: "Failed to load documents for preview",
        variant: "destructive"
      });
      return [];
    }
  };

  const downloadZip = async () => {
    // For now, use the export all function
    // In a production environment, you'd implement server-side ZIP creation
    await exportAllDocuments();
    
    toast({
      title: "ZIP Download",
      description: "Documents downloaded individually. Server-side ZIP creation coming soon.",
      variant: "default"
    });
  };

  return {
    isExporting,
    progress,
    exportAllDocuments,
    previewAllDocuments,
    downloadZip
  };
};