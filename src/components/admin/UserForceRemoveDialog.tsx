import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserForceRemoveDialogProps {
  onRemoveSuccess: () => void;
}

const UserForceRemoveDialog = ({ onRemoveSuccess }: UserForceRemoveDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForceRemove = async () => {
    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { email: email.trim() }
      });

      if (error) {
        console.error('Error force removing user:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to remove user',
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
        description: `User with email ${email} has been removed from the system`,
      });

      setEmail('');
      setOpen(false);
      onRemoveSuccess();
    } catch (error) {
      console.error('Error force removing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Force Remove by Email
        </Button>
      </DialogTrigger>
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>Force Remove User by Email</DialogTitle>
          <DialogDescription>
            Remove a user from the system by email address. This will clean up both authentication and profile records.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleForceRemove} 
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Removing...' : 'Force Remove'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserForceRemoveDialog;