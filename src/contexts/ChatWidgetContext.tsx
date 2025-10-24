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

  // Auto-detect deal AND conversation context from URL
  useEffect(() => {
    console.log('[ChatWidget] Checking URL for context:', location.pathname);
    
    // Check for conversation ID in URL
    const conversationMatch = location.pathname.match(/\/conversations\/([a-f0-9-]+)/i);
    if (conversationMatch) {
      const convId = conversationMatch[1];
      console.log('[ChatWidget] Detected conversation from URL:', convId);
      
      // Load this conversation's messages
      if (convId !== currentConversationId) {
        setCurrentConversationId(convId);
        fetchMessages(convId);
      }
      return;
    }
    
    // Check for deal ID in URL
    const dealMatch = location.pathname.match(/\/deal\/([a-f0-9-]+)/i);
    if (dealMatch) {
      const dealId = dealMatch[1];
      console.log('[ChatWidget] Detected deal from URL:', dealId);
      fetchDealContext(dealId);
    }
  }, [location.pathname, currentConversationId]);

  // Fetch unread count on mount
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Load widget settings
  useEffect(() => {
    console.log('[ChatWidget] useEffect triggered for settings load');
    
    const loadSettings = async () => {
      console.log('[ChatWidget] Starting to load settings...');
      
      const defaultSettings: WidgetSettings = {
        widget_position: 'bottom-right',
        primary_color: '#D4AF37',
        widget_size: 'medium',
        bubble_style: 'circle',
        minimized_tooltip: 'Chat with us',
        widget_title: 'Chat with Broker Team',
        placeholder_text: 'Type your message...',
        initial_greeting: 'Hi! Have questions about a deal? We\'re here to help.',
        show_online_status: true,
        enable_typing_indicators: true,
        enable_file_attachments: true,
        enable_emojis: true,
        auto_open_enabled: false,
        auto_open_delay: 5000,
        away_message: 'We\'re currently offline.',
        ask_button_label: 'Ask',
        info_button_label: 'Info',
        interest_button_label: 'Interest',
        call_button_label: 'Call',
        enable_manual_scheduling: true,
        broker_email_notifications: true,
        investor_email_notifications: true
      } as WidgetSettings;
      
      try {
        console.log('[ChatWidget] Fetching from database...');
        const { data, error } = await supabase
          .from('widget_settings')
          .select('*')
          .limit(1);
        
        console.log('[ChatWidget] Fetch complete:', { hasData: !!data, dataLength: data?.length, error });
        
        if (error) {
          console.error('[ChatWidget] Database error:', error);
          console.log('[ChatWidget] Using default settings due to error');
          setSettings(defaultSettings);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('[ChatWidget] Settings loaded from DB');
          setSettings(data[0] as WidgetSettings);
        } else {
          console.warn('[ChatWidget] No settings in database, using defaults');
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error('[ChatWidget] Exception during fetch:', err);
        console.log('[ChatWidget] Using default settings due to exception');
        setSettings(defaultSettings);
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

  // Debug: Log isOpen changes
  useEffect(() => {
    console.log('[ChatWidgetContext] isOpen changed:', isOpen);
  }, [isOpen]);

  // Debug: Log settings changes
  useEffect(() => {
    console.log('[ChatWidgetContext] settings loaded:', !!settings);
  }, [settings]);

  // Debug: Log messages changes
  useEffect(() => {
    console.log('[ChatWidgetContext] messages changed:', {
      count: messages.length,
      conversationId: currentConversationId
    });
  }, [messages, currentConversationId]);

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
    console.log('[ChatWidget] fetchMessages called for conversation:', conversationId);
    try {
      const { data, error } = await supabase
        .from('conversation_messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      console.log('[ChatWidget] Fetch messages result:', { 
        count: data?.length || 0, 
        error,
        conversationId 
      });
      
      if (error || !data) {
        console.error('[ChatWidget] Error fetching messages:', error);
        setMessages([]);
        return;
      }
      
      console.log('[ChatWidget] Setting messages:', data);
      setMessages(data as any as Message[]);
    } catch (error) {
      console.error('[ChatWidget] Exception fetching messages:', error);
      setMessages([]);
    }
  };

  const openWidget = useCallback(async (dealId?: string, dealName?: string) => {
    console.log('[ChatWidget] openWidget called:', { 
      dealId, 
      dealName, 
      hasUser: !!user,
      currentConvId: currentConversationId
    });
    
    if (!user) {
      console.warn('[ChatWidget] No user, cannot open widget');
      return;
    }

    setIsLoading(true);
    setIsOpen(true); // Open immediately for better UX
    
    // If we already have a conversation ID (e.g., from URL), use it directly
    if (currentConversationId) {
      console.log('[ChatWidget] Using existing conversation from context:', currentConversationId);
      await fetchMessages(currentConversationId);
      setIsLoading(false);
      sessionStorage.removeItem('chatWidgetClosed');
      return;
    }
    
    // Otherwise, create or find a conversation based on deal context
    if (dealId && dealName) {
      console.log('[ChatWidget] Setting deal context:', { dealId, dealName });
      setCurrentDealContext({ id: dealId, name: dealName });
    }

    const conversationId = await ensureConversation(dealId, dealName);
    console.log('[ChatWidget] Conversation ensured:', conversationId);
    
    if (conversationId) {
      setCurrentConversationId(conversationId);
      await fetchMessages(conversationId);
    } else {
      console.error('[ChatWidget] Failed to get conversation ID');
      setMessages([]);
    }

    setIsLoading(false);
    sessionStorage.removeItem('chatWidgetClosed');
  }, [user, currentConversationId]); // fetchMessages and ensureConversation are stable functions

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

  console.log('[ChatWidgetProvider] Rendering with state:', { 
    isOpen, 
    hasSettings: !!settings,
    hasUser: !!user,
    messagesCount: messages.length 
  });

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
