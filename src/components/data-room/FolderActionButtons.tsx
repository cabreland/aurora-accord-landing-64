import React, { useState } from 'react';
import { Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { DataRoomFolder } from '@/hooks/useDataRoom';

interface FolderActionButtonsProps {
  folder: DataRoomFolder;
  dealId: string;
}

export const FolderActionButtons: React.FC<FolderActionButtonsProps> = ({
  folder,
  dealId,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const handleMarkNA = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('data_room_folders')
        .update({ is_not_applicable: true, is_required: false })
        .eq('id', folder.id);

      if (error) throw error;

      toast.success('Folder marked as N/A');
      queryClient.invalidateQueries({ queryKey: ['data-room-folders', dealId] });
    } catch (err) {
      console.error('Error marking folder as N/A:', err);
      toast.error('Failed to update folder');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkRequired = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('data_room_folders')
        .update({ is_required: true, is_not_applicable: false })
        .eq('id', folder.id);

      if (error) throw error;

      toast.success('Folder marked as required');
      queryClient.invalidateQueries({ queryKey: ['data-room-folders', dealId] });
    } catch (err) {
      console.error('Error marking folder as required:', err);
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
