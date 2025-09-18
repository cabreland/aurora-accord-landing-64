import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserInviteDialogProps {
  onInviteSuccess: () => void;
}

const UserInviteDialog = ({ onInviteSuccess }: UserInviteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const { toast } = useToast();

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-custom-invite', {
        body: { 
          email: inviteEmail.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: inviteRole
        }
      });

      if (error) {
        console.error('Error inviting user:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to invite user',
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
        description: 'Branded invitation sent successfully! User will receive an email to set their password.',
      });

      setIsOpen(false);
      setInviteEmail('');
      setFirstName('');
      setLastName('');
      setInviteRole('viewer');
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
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInviteUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
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
          <div>
            <Label htmlFor="inviteRole">Role</Label>
            <Select value={inviteRole} onValueChange={(value: 'viewer' | 'editor' | 'admin') => setInviteRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Investor (Viewer)</SelectItem>
                <SelectItem value="editor">Manager (Editor)</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => {
              setIsOpen(false);
              setInviteEmail('');
              setFirstName('');
              setLastName('');
              setInviteRole('viewer');
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