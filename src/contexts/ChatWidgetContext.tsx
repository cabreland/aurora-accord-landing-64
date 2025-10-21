import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'investor' | 'broker' | 'system';
  message_text: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
}

interface DealContext {
  id: string;
  name: string;
}

interface ChatWidgetContextType {
  isOpen: boolean;
  messages: Message[];
  unreadCount: number;
  currentDealContext: DealContext | null;
  isLoading: boolean;
  settings: WidgetSettings | null;
  openWidget: (dealId?: string, dealName?: string) => Promise<void>;
  closeWidget: () => void;
  toggleWidget: () => void;
  sendMessage: (text: string) => Promise<void>;
  setDealContext: (context: DealContext | null) => void;
  markAsRead: () => Promise<void>;
}

const ChatWidgetContext = createContext<ChatWidgetContextType | null>(null);

export const ChatWidgetProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentDealContext, setCurrentDealContext] = useState<DealContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<WidgetSettings | null>(null);

  // Auto-detect deal context from URL
  useEffect(() => {
    const dealMatch = location.pathname.match(/\/deal\/([a-f0-9-]+)/i);
    if (dealMatch) {
      const dealId = dealMatch[1];
      fetchDealContext(dealId);
    }
  }, [location.pathname]);

  // Fetch unread count on mount
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Load widget settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('widget_settings' as any)
          .select('*')
          .maybeSingle();
        
        if (error) {
          console.error('[ChatWidget] Error loading settings:', error);
          return;
        }
        
        if (data) {
          console.log('[ChatWidget] Settings loaded:', data);
          setSettings(data as any);
        }
      } catch (err) {
        console.error('[ChatWidget] Failed to load settings:', err);
      }
    };
    loadSettings();

    // Subscribe to settings changes
    const channel = supabase
      .channel('widget-settings-changes')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'widget_settings'
        } as any,
        (payload) => {
          console.log('[ChatWidget] Settings updated:', payload);
          setSettings(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-open widget if enabled
  useEffect(() => {
    if (settings?.auto_open_enabled && !sessionStorage.getItem('chatWidgetClosed') && user) {
      const timer = setTimeout(() => {
        console.log('[ChatWidget] Auto-opening widget');
        setIsOpen(true);
      }, settings.auto_open_delay || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [settings, user]);

  // Subscribe to messages for current conversation
  useEffect(() => {
    if (!currentConversationId) return;

    console.log('[ChatWidget] Subscribing to conversation:', currentConversationId);
    
    const channel = supabase
      .channel(`conversation-${currentConversationId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${currentConversationId}`
        } as any,
        (payload) => {
          console.log('[ChatWidget] New message received:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
          if (payload.new.sender_type === 'broker') {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversationId]);

  const fetchDealContext = async (dealId: string) => {
    try {
      const { data, error } = await supabase
        .from('deals' as any)
        .select('id, company_name')
        .eq('id', dealId)
        .single();
      
      if (error || !data) {
        console.error('[ChatWidget] Error fetching deal context:', error);
        return;
      }
      
      setCurrentDealContext({ 
        id: (data as any).id, 
        name: (data as any).company_name 
      });
    } catch (error) {
      console.error('[ChatWidget] Error fetching deal context:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations' as any)
        .select('unread_count_investor')
        .eq('investor_id', user?.id);
      
      if (error) {
        console.error('[ChatWidget] Error fetching unread count:', error);
        return;
      }
      
      if (data) {
        const total = data.reduce((sum: number, conv: any) => sum + (conv.unread_count_investor || 0), 0);
        setUnreadCount(total);
      }
    } catch (error) {
      console.error('[ChatWidget] Error fetching unread count:', error);
    }
  };

  const ensureConversation = async (dealId?: string, dealName?: string): Promise<string | null> => {
    try {
      if (!user) return null;

      const { data: existing, error: existingError } = await supabase
        .from('conversations' as any)
        .select('id')
        .eq('investor_id', user.id)
        .eq('deal_id', dealId || null)
        .maybeSingle();

      if (existingError) {
        console.error('[ChatWidget] Error checking existing conversation:', existingError);
      }

      if (existing && !existingError) {
        return (existing as any).id;
      }

      const { data: newConv, error } = await supabase
        .from('conversations' as any)
        .insert({
          investor_id: user.id,
          deal_id: dealId || null,
          deal_name: dealName || null,
          subject: dealName ? `Inquiry about ${dealName}` : 'General Inquiry'
        } as any)
        .select()
        .single();

      if (error || !newConv) throw error;
      return (newConv as any).id || null;
    } catch (error) {
      console.error('[ChatWidget] Error ensuring conversation:', error);
      return null;
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error || !data) {
        console.error('[ChatWidget] Error fetching messages:', error);
        return;
      }
      
      setMessages(data as any as Message[]);
    } catch (error) {
      console.error('[ChatWidget] Error fetching messages:', error);
    }
  };

  const openWidget = useCallback(async (dealId?: string, dealName?: string) => {
    console.log('[ChatWidget] openWidget called:', { dealId, dealName, user: !!user });
    
    if (!user) {
      console.warn('[ChatWidget] No user, cannot open widget');
      return;
    }

    setIsLoading(true);
    
    if (dealId && dealName) {
      setCurrentDealContext({ id: dealId, name: dealName });
    }

    const conversationId = await ensureConversation(dealId, dealName);
    if (conversationId) {
      setCurrentConversationId(conversationId);
      await fetchMessages(conversationId);
    }

    setIsOpen(true);
    setIsLoading(false);
    sessionStorage.removeItem('chatWidgetClosed');
  }, [user]);

  const closeWidget = useCallback(() => {
    console.log('[ChatWidget] closeWidget called');
    setIsOpen(false);
    sessionStorage.setItem('chatWidgetClosed', 'true');
  }, []);

  const toggleWidget = useCallback(() => {
    console.log('[ChatWidget] toggleWidget called, current isOpen:', isOpen);
    if (isOpen) {
      closeWidget();
    } else {
      openWidget(currentDealContext?.id, currentDealContext?.name);
    }
  }, [isOpen, currentDealContext, openWidget, closeWidget]);

  const sendMessage = useCallback(async (text: string) => {
    if (!user || !text.trim()) return;

    try {
      let conversationId = currentConversationId;
      
      if (!conversationId) {
        conversationId = await ensureConversation(
          currentDealContext?.id,
          currentDealContext?.name
        );
        if (!conversationId) throw new Error('Failed to create conversation');
        setCurrentConversationId(conversationId);
      }

      const { error } = await supabase
        .from('conversation_messages' as any)
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: 'investor',
          message_text: text,
          message_type: 'reply'
        } as any);

      if (error) throw error;

      await supabase
        .from('conversations' as any)
        .update({
          last_message_at: new Date().toISOString(),
          unread_count_broker: supabase.rpc('increment' as any, { row_id: conversationId } as any)
        } as any)
        .eq('id', conversationId);

    } catch (error) {
      console.error('[ChatWidget] Error sending message:', error);
      throw error;
    }
  }, [user, currentConversationId, currentDealContext]);

  const markAsRead = useCallback(async () => {
    if (!currentConversationId || !user) return;

    try {
      await supabase
        .from('conversation_messages' as any)
        .update({ read_at: new Date().toISOString() } as any)
        .eq('conversation_id', currentConversationId)
        .eq('sender_type', 'broker')
        .is('read_at', null);

      await supabase
        .from('conversations' as any)
        .update({ unread_count_investor: 0 } as any)
        .eq('id', currentConversationId);

      setUnreadCount(0);
    } catch (error) {
      console.error('[ChatWidget] Error marking as read:', error);
    }
  }, [currentConversationId, user]);

  const value = {
    isOpen,
    messages,
    unreadCount,
    currentDealContext,
    isLoading,
    settings,
    openWidget,
    closeWidget,
    toggleWidget,
    sendMessage,
    setDealContext: setCurrentDealContext,
    markAsRead
  };

  return (
    <ChatWidgetContext.Provider value={value}>
      {children}
    </ChatWidgetContext.Provider>
  );
};

export const useChatWidget = () => {
  const context = useContext(ChatWidgetContext);
  if (!context) {
    throw new Error('useChatWidget must be used within ChatWidgetProvider');
  }
  return context;
};
