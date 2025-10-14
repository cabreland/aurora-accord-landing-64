import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Message {
  id: string;
  deal_id: string | null;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export const useInvestorMessages = (dealId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchUnreadCount();
    }
  }, [user, dealId]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('investor_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('investor_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const sendMessage = async (recipientId: string, message: string, dealIdParam?: string) => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    try {
      const { error } = await supabase
        .from('investor_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message,
          deal_id: dealIdParam || dealId || null
        });

      if (error) throw error;

      toast.success('Message sent');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('investor_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      await fetchMessages();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    messages,
    unreadCount,
    loading,
    sendMessage,
    markAsRead,
    refresh: fetchMessages
  };
};
