import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/hooks/useUserProfile';

interface UserDeleteDialogProps {
  user: UserProfile;
  onDeleteSuccess: () => void;
}

const UserDeleteDialog = ({ user, onDeleteSuccess }: UserDeleteDialogProps) => {
  const { toast } = useToast();

  const handleDeleteUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: user.user_id }
      });

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete user',
          variant: 'destructive',
        });
        return;
      }

      if (data?.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `User ${user.email} has been permanently deleted from the system`,
      });

      onDeleteSuccess();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="z-50">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User Permanently</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete {user.first_name} {user.last_name} ({user.email})? 
            <br /><br />
            <strong>This will:</strong>
            <ul className="list-disc ml-4 mt-2">
              <li>Remove the user from the authentication system</li>
              <li>Delete their profile and all associated data</li>
              <li>Prevent them from signing in again</li>
            </ul>
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteUser}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes, Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDeleteDialog;