import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { WidgetSettings } from './useWidgetSettings';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  message_text: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  id: string;
  deal_id: string | null;
  deal_name: string | null;
  subject: string;
  last_message_at: string;
}

export const useChatWidget = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentDealContext, setCurrentDealContext] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoOpened = useRef(false);

  // Auto-detect deal context from URL
  useEffect(() => {
    const dealMatch = location.pathname.match(/\/deal\/([^/]+)/);
    if (dealMatch) {
      const dealId = dealMatch[1];
      fetchDealContext(dealId);
    } else {
      setCurrentDealContext(null);
    }
  }, [location.pathname]);

  const fetchDealContext = async (dealId: string) => {
    try {
      const { data } = await supabase
        .from('deals' as any)
        .select('id, company_name')
        .eq('id', dealId)
        .single();

      if (data) {
        setCurrentDealContext({ id: (data as any).id, name: (data as any).company_name });
      }
    } catch (error) {
      console.error('Error fetching deal context:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('conversations' as any)
        .select('unread_count_investor')
        .eq('investor_id', user.id);

      if (data) {
        const total = (data as any).reduce((sum: number, conv: any) => sum + (conv.unread_count_investor || 0), 0);
        setUnreadCount(total);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch or create conversation based on deal context
  const ensureConversation = async (dealId?: string, dealName?: string) => {
    if (!user) return null;

    const targetDealId = dealId || currentDealContext?.id;
    const targetDealName = dealName || currentDealContext?.name;

    try {
      // Check for existing conversation
      let query = supabase
        .from('conversations' as any)
        .select('*')
        .eq('investor_id', user.id);

      if (targetDealId) {
        query = query.eq('deal_id', targetDealId);
      } else {
        query = query.is('deal_id', null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        setCurrentConversation(existing as any);
        await fetchMessages((existing as any).id);
        return existing as any;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations' as any)
        .insert({
          investor_id: user.id,
          deal_id: targetDealId || null,
          deal_name: targetDealName || 'General Inquiry',
          subject: targetDealId ? `Question about ${targetDealName}` : 'General Inquiry',
          channel: 'platform',
          status: 'active',
          unread_count_broker: 0
        } as any)
        .select()
        .single();

      if (error) throw error;

      setCurrentConversation(newConv as any);
      return newConv as any;
    } catch (error) {
      console.error('Error ensuring conversation:', error);
      toast.error('Failed to start conversation');
      return null;
    }
  };

  // Fetch messages for conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;

    setIsLoading(true);
    try {
      let conversation = currentConversation;
      
      if (!conversation) {
        conversation = await ensureConversation();
        if (!conversation) {
          throw new Error('Failed to create conversation');
        }
      }

      const { error } = await supabase
        .from('conversation_messages' as any)
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          sender_type: 'investor',
          message_type: 'reply',
          message_text: text
        } as any);

      if (error) throw error;

      // Update conversation last_message_at and increment broker unread count
      await supabase
        .from('conversations' as any)
        .update({
          last_message_at: new Date().toISOString(),
          unread_count_broker: supabase.rpc('increment' as any, { x: 1 })
        } as any)
        .eq('id', conversation.id);

      // Refresh messages
      await fetchMessages(conversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Open widget with optional deal context
  const openWidget = async (dealId?: string, dealName?: string) => {
    setIsOpen(true);
    await ensureConversation(dealId, dealName);
  };

  // Toggle widget
  const toggleWidget = () => {
    if (!isOpen) {
      ensureConversation();
    }
    setIsOpen(!isOpen);
  };

  // Mark messages as read
  const markAsRead = async () => {
    if (!currentConversation) return;

    try {
      await supabase
        .from('conversations' as any)
        .update({ unread_count_investor: 0 } as any)
        .eq('id', currentConversation.id);

      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Load widget settings
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from('widget_settings' as any)
        .select('*')
        .maybeSingle();
      
      if (data) {
        setSettings(data as any);
      }
    };
    loadSettings();
  }, []);

  // Auto-open widget if enabled
  useEffect(() => {
    if (settings && settings.auto_open_enabled && !hasAutoOpened.current) {
      const hasClosedBefore = sessionStorage.getItem('chat-widget-closed');
      
      if (!hasClosedBefore) {
        setTimeout(() => {
          setIsOpen(true);
          hasAutoOpened.current = true;
        }, settings.auto_open_delay);
      }
    }
  }, [settings]);

  // Initialize
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !currentConversation) return;

    const channel = supabase
      .channel('chat-widget-messages')
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${currentConversation.id}`
        } as any,
        () => {
          fetchMessages(currentConversation.id);
          if (isOpen) {
            markAsRead();
          } else {
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversation, isOpen]);

  const closeWidget = () => {
    setIsOpen(false);
    sessionStorage.setItem('chat-widget-closed', 'true');
  };

  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return {
    isOpen,
    toggleWidget,
    openWidget,
    closeWidget,
    messages,
    unreadCount,
    currentDealContext,
    setDealContext: setCurrentDealContext,
    currentConversation,
    sendMessage,
    markAsRead,
    isLoading,
    isTyping,
    settings,
    inputRef,
    focusInput
  };
};
