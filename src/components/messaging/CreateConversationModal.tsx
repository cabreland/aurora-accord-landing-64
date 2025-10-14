import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserType } from './types';

interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: UserType;
  onConversationCreated: (conversationId: string) => void;
}

export const CreateConversationModal = ({ 
  isOpen, 
  onClose, 
  userType,
  onConversationCreated 
}: CreateConversationModalProps) => {
  const [subject, setSubject] = useState('');
  const [dealId, setDealId] = useState<string>('');
  const [channel, setChannel] = useState('platform');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!subject.trim()) {
      toast({ title: 'Subject is required', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let dealName = '';
      if (dealId) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', dealId)
          .single();
        dealName = company?.name || '';
      }

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          investor_id: user.id,
          deal_id: dealId || null,
          deal_name: dealName,
          subject: subject.trim(),
          channel,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Conversation created successfully' });
      onConversationCreated(conversation.id);
      onClose();
      setSubject('');
      setDealId('');
      setChannel('platform');
    } catch (error: any) {
      toast({ title: 'Failed to create conversation', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter conversation subject"
            />
          </div>
          
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Platform</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
