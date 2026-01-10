import React, { useState } from 'react';
import { Download, CheckCircle, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DataRoomDocument } from '@/hooks/useDataRoom';

interface DataRoomBulkActionsProps {
  selectedDocuments: Set<string>;
  documents: DataRoomDocument[];
  onClearSelection: () => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkApprove: (ids: string[]) => Promise<void>;
  canApprove?: boolean;
  canDelete?: boolean;
}

export const DataRoomBulkActions: React.FC<DataRoomBulkActionsProps> = ({
  selectedDocuments,
  documents,
  onClearSelection,
  onBulkDelete,
  onBulkApprove,
  canApprove = true,
  canDelete = true,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCount = selectedDocuments.size;
  const selectedDocs = documents.filter((doc) => selectedDocuments.has(doc.id));

  const handleBulkDownload = async () => {
    setIsDownloading(true);
    try {
      for (const doc of selectedDocs) {
        const { data, error } = await supabase.storage
          .from('data-room-documents')
          .createSignedUrl(doc.file_path, 60);

        if (error) {
          console.error(`Error getting URL for ${doc.file_name}:`, error);
          continue;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = doc.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      toast.success(`Downloaded ${selectedCount} documents`);
    } catch (err) {
      console.error('Error downloading documents:', err);
      toast.error('Failed to download some documents');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBulkApprove = async () => {
    setIsApproving(true);
    try {
      await onBulkApprove(Array.from(selectedDocuments));
      toast.success(`Approved ${selectedCount} documents`);
      onClearSelection();
    } catch (err) {
      toast.error('Failed to approve some documents');
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await onBulkDelete(Array.from(selectedDocuments));
      toast.success(`Deleted ${selectedCount} documents`);
      onClearSelection();
    } catch (err) {
      toast.error('Failed to delete some documents');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg px-6 py-4 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download
              </Button>

              {canApprove && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-success hover:text-success"
                  onClick={handleBulkApprove}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              )}
            </div>

            <div className="h-6 w-px bg-border" />

            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
