import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/hooks/useUserProfile';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserEditDialogProps {
  user: UserProfile;
  onEditSuccess: () => void;
}

const UserEditDialog = ({ user, onEditSuccess }: UserEditDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.get('firstName') as string,
          last_name: formData.get('lastName') as string,
          role: formData.get('role') as UserRole,
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update user',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });

      setIsOpen(false);
      onEditSuccess();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={user.first_name || ''}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user.last_name || ''}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Administrator</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="editor">Manager</SelectItem>
                <SelectItem value="viewer">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;