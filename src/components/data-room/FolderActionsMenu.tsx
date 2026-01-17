import React, { useState } from 'react';
import { MoreHorizontal, Ban, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DataRoomFolder } from '@/hooks/useDataRoom';

interface FolderActionsMenuProps {
  folder: DataRoomFolder;
  dealId: string;
  onUpdate?: () => void;
  onFolderUpdate?: (folderId: string, updates: Partial<DataRoomFolder>) => void;
}

export const FolderActionsMenu: React.FC<FolderActionsMenuProps> = ({
  folder,
  dealId,
  onUpdate,
  onFolderUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleMarkNotApplicable = async () => {
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
      
      toast.success(`"${folder.name}" marked as Not Applicable`);
      onUpdate?.();
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
      
      toast.success(`"${folder.name}" marked as Required`);
      onUpdate?.();
    } catch (err) {
      console.error('Error marking folder as required:', err);
      // Revert optimistic update on failure
      onFolderUpdate?.(folder.id, previousState);
      toast.error('Failed to update folder');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      // First check if folder has documents
      const { data: docs } = await supabase
        .from('data_room_documents')
        .select('id')
        .eq('folder_id', folder.id)
        .limit(1);

      if (docs && docs.length > 0) {
        toast.error('Cannot delete folder with documents. Remove documents first.');
        setShowDeleteDialog(false);
        return;
      }

      const { error } = await supabase
        .from('data_room_folders')
        .delete()
        .eq('id', folder.id);

      if (error) throw error;
      
      toast.success(`"${folder.name}" deleted`);
      onUpdate?.();
    } catch (err) {
      console.error('Error deleting folder:', err);
      toast.error('Failed to delete folder');
    } finally {
      setIsUpdating(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={isUpdating}
            onClick={(e) => e.stopPropagation()}
          >
            {isUpdating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MoreHorizontal className="h-3.5 w-3.5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {!folder.is_not_applicable ? (
            <DropdownMenuItem onClick={handleMarkNotApplicable}>
              <Ban className="h-4 w-4 mr-2 text-muted-foreground" />
              Mark as N/A
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleMarkRequired}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
              Mark as Required
            </DropdownMenuItem>
          )}
          {!folder.is_not_applicable && !folder.is_required && (
            <DropdownMenuItem onClick={handleMarkRequired}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
              Mark as Required
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{folder.name}"? This action cannot be undone.
              Folders with documents cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
