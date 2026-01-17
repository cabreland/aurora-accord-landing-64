import React, { useState } from 'react';
import { Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DataRoomFolder } from '@/hooks/useDataRoom';

interface FolderActionButtonsProps {
  folder: DataRoomFolder;
  dealId: string;
  onFolderUpdate?: (folderId: string, updates: Partial<DataRoomFolder>) => void;
}

export const FolderActionButtons: React.FC<FolderActionButtonsProps> = ({
  folder,
  dealId,
  onFolderUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkNA = async () => {
    // Optimistic update - instant UI feedback
    const previousState = { is_not_applicable: folder.is_not_applicable, is_required: folder.is_required };
    onFolderUpdate?.(folder.id, { is_not_applicable: true, is_required: false });
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('data_room_folders')
        .update({ is_not_applicable: true, is_required: false })
        .eq('id', folder.id);

      if (error) throw error;

      toast.success('Folder marked as N/A');
    } catch (err) {
      console.error('Error marking folder as N/A:', err);
      // Revert optimistic update on failure
      onFolderUpdate?.(folder.id, previousState);
      toast.error('Failed to update folder');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkRequired = async () => {
    // Optimistic update - instant UI feedback
    const previousState = { is_not_applicable: folder.is_not_applicable, is_required: folder.is_required };
    onFolderUpdate?.(folder.id, { is_required: true, is_not_applicable: false });
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('data_room_folders')
        .update({ is_required: true, is_not_applicable: false })
        .eq('id', folder.id);

      if (error) throw error;

      toast.success('Folder marked as required');
    } catch (err) {
      console.error('Error marking folder as required:', err);
      // Revert optimistic update on failure
      onFolderUpdate?.(folder.id, previousState);
      toast.error('Failed to update folder');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {folder.is_not_applicable ? (
        <Button
          variant="outline"
          size="sm"
          className="text-success hover:text-success"
          onClick={handleMarkRequired}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Mark Required
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkNA}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Ban className="h-4 w-4 mr-2" />
          )}
          Mark as N/A
        </Button>
      )}
    </div>
  );
};
