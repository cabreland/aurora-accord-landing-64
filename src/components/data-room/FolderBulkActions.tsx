import React, { useState } from 'react';
import { Ban, CheckCircle2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface FolderBulkActionsProps {
  selectedFolderIds: Set<string>;
  dealId: string;
  onClearSelection: () => void;
}

export const FolderBulkActions: React.FC<FolderBulkActionsProps> = ({
  selectedFolderIds,
  dealId,
  onClearSelection,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const selectedCount = selectedFolderIds.size;

  const handleBulkMarkNA = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('data_room_folders')
        .update({ is_not_applicable: true, is_required: false })
        .in('id', Array.from(selectedFolderIds));

      if (error) throw error;
      
      toast.success(`${selectedCount} folders marked as N/A`);
      queryClient.invalidateQueries({ queryKey: ['data-room-folders', dealId] });
      onClearSelection();
    } catch (err) {
      console.error('Error marking folders as N/A:', err);
      toast.error('Failed to update folders');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkMarkRequired = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('data_room_folders')
        .update({ is_required: true, is_not_applicable: false })
        .in('id', Array.from(selectedFolderIds));

      if (error) throw error;
      
      toast.success(`${selectedCount} folders marked as required`);
      queryClient.invalidateQueries({ queryKey: ['data-room-folders', dealId] });
      onClearSelection();
    } catch (err) {
      console.error('Error marking folders as required:', err);
      toast.error('Failed to update folders');
    } finally {
      setIsUpdating(false);
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
              {selectedCount} folder{selectedCount !== 1 ? 's' : ''} selected
            </span>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkNA}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                Mark as N/A
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-success hover:text-success"
                onClick={handleBulkMarkRequired}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Mark Required
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
