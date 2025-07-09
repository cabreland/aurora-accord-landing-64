import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserInviteDialogProps {
  onInviteSuccess: () => void;
}

const UserInviteDialog = ({ onInviteSuccess }: UserInviteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const { toast } = useToast();

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
        data: { invited_by_admin: true }
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to invite user. Make sure you have admin privileges.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'User invitation sent successfully',
      });

      setIsOpen(false);
      setInviteEmail('');
      onInviteSuccess();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInviteUser} className="space-y-4">
          <div>
            <Label htmlFor="inviteEmail">Email Address</Label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => {
              setIsOpen(false);
              setInviteEmail('');
            }}>
              Cancel
            </Button>
            <Button type="submit">
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserInviteDialog;