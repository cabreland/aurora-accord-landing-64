import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

interface UserDeleteDialogProps {
  user: UserProfile;
  onDeleteSuccess: () => void;
}

const UserDeleteDialog = ({ user, onDeleteSuccess }: UserDeleteDialogProps) => {
  const { toast } = useToast();

  const handleDeleteUser = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `User ${user.email} deleted successfully`,
      });

      onDeleteSuccess();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {user.first_name} {user.last_name} ({user.email})? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteUser}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDeleteDialog;