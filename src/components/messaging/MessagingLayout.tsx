import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeftPane } from './LeftPane';
import { ConversationsList } from './ConversationsList';
import { ChatPane } from './ChatPane';
import { CreateConversationModal } from './CreateConversationModal';
import { UserType, FilterType, ChannelType, ConversationType, MessageType } from './types';

interface MessagingLayoutProps {
  userType: UserType;
}

export const MessagingLayout = ({ userType }: MessagingLayoutProps) => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [channel, setChannel] = useState<ChannelType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, filter, channel, searchQuery]);

  useEffect(() => {
    if (conversationId && currentUserId) {
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId, currentUserId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!currentUserId) return;

    const conversationsChannel = supabase
      .channel('conversations_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'conversations' 
      }, () => {
        fetchConversations();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('messages_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'conversation_messages',
        filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined
      }, () => {
        if (conversationId) {
          fetchMessages(conversationId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUserId, conversationId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchConversations = async () => {
    try {
      let query = supabase
        .from('conversations' as any)
        .select(`
          *,
          conversation_messages(message_text, created_at, message_type)
        `)
        .order('last_message_at', { ascending: false });

      if (channel !== 'all') {
        query = query.eq('channel', channel);
      }

      if (filter === 'unread') {
        query = query.or(`unread_count_investor.gt.0,unread_count_broker.gt.0`);
      } else if (filter === 'deal-specific') {
        query = query.not('deal_id', 'is', null);
      } else if (filter === 'general') {
        query = query.is('deal_id', null);
      } else if (filter === 'urgent') {
        query = query.eq('priority', 'urgent');
      } else if (filter === 'high-priority') {
        query = query.in('priority', ['high', 'urgent']);
      } else if (filter === 'resolved') {
        query = query.eq('status', 'resolved');
      } else if (filter === 'archived') {
        query = query.not('archived_at', 'is', null);
      }

      // Exclude archived by default unless specifically filtering for archived
      if (filter !== 'archived') {
        query = query.is('archived_at', null);
      }

      if (searchQuery) {
        query = query.ilike('subject', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedConversations: ConversationType[] = await Promise.all(
        (data || []).map(async (conv: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('user_id', conv.investor_id)
            .single();

          const lastMsg = conv.conversation_messages?.[0];
          const unreadCount = userType === 'investor' 
            ? conv.unread_count_investor 
            : conv.unread_count_broker;

          return {
            id: conv.id,
            subject: conv.subject,
            dealId: conv.deal_id,
            dealName: conv.deal_name,
            investorId: conv.investor_id,
            participants: [{
              id: conv.investor_id,
              name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email : 'Unknown',
              avatar: null,
              role: 'investor'
            }],
            lastMessage: lastMsg?.message_text || 'No messages yet',
            lastMessageTime: lastMsg?.created_at || conv.created_at,
            unread: unreadCount,
            channel: conv.channel,
            messageType: lastMsg?.message_type,
            status: conv.status,
            priority: conv.priority || 'normal',
            archivedAt: conv.archived_at,
            assignedTo: conv.assigned_to
          };
        })
      );

      setConversations(formattedConversations);
    } catch (error: any) {
      toast({ title: 'Failed to fetch conversations', description: error.message, variant: 'destructive' });
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages' as any)
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: MessageType[] = await Promise.all(
        (data || []).map(async (msg: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('user_id', msg.sender_id)
            .single();

          const name = profile 
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email 
            : 'Unknown';
          const initials = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

          return {
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            senderType: msg.sender_type,
            senderName: name,
            senderInitials: initials,
            content: msg.message_text,
            timestamp: new Date(msg.created_at),
            isMe: msg.sender_id === currentUserId,
            messageType: msg.message_type
          };
        })
      );

      setMessages(formattedMessages);
    } catch (error: any) {
      toast({ title: 'Failed to fetch messages', description: error.message, variant: 'destructive' });
    }
  };

  const markAsRead = async (convId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', currentUserId)
      .single();

    const updateField = profile?.role === 'viewer' 
      ? 'unread_count_investor' 
      : 'unread_count_broker';

    await supabase
      .from('conversations' as any)
      .update({ [updateField]: 0 } as any)
      .eq('id', convId);
  };

  const handleSendMessage = async (content: string) => {
    if (!conversationId) return;

    setIsSending(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', currentUserId)
        .single();

      const senderType = profile?.role === 'viewer' ? 'investor' : 'broker';

      const { error } = await supabase
        .from('conversation_messages' as any)
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          sender_type: senderType,
          message_text: content,
          message_type: 'reply'
        } as any);

      if (error) throw error;

      // Update conversation last_message_at and unread count
      const unreadField = senderType === 'investor' 
        ? 'unread_count_broker' 
        : 'unread_count_investor';

      const currentConv = conversations.find(c => c.id === conversationId);
      const currentUnread = senderType === 'investor' 
        ? (currentConv as any)?.unread_count_broker || 0
        : (currentConv as any)?.unread_count_investor || 0;

      await supabase
        .from('conversations' as any)
        .update({ 
          last_message_at: new Date().toISOString(),
          [unreadField]: currentUnread + 1
        } as any)
        .eq('id', conversationId);

      fetchMessages(conversationId);
      fetchConversations();
    } catch (error: any) {
      toast({ title: 'Failed to send message', description: error.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationSelect = (id: string) => {
    const basePath = userType === 'investor' ? '/investor-portal/messages' : '/dashboard/conversations';
    navigate(`${basePath}/${id}`);
  };

  const handleConversationCreated = (id: string) => {
    fetchConversations();
    handleConversationSelect(id);
  };

  const handleResolve = async () => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from('conversations' as any)
        .update({ status: 'resolved' } as any)
        .eq('id', conversationId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Conversation marked as resolved' });
      fetchConversations();
    } catch (error: any) {
      toast({ title: 'Failed to resolve conversation', description: error.message, variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from('conversations' as any)
        .update({ archived_at: new Date().toISOString() } as any)
        .eq('id', conversationId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Conversation archived' });
      
      const basePath = userType === 'investor' ? '/investor-portal/messages' : '/dashboard/conversations';
      navigate(basePath);
      
      fetchConversations();
    } catch (error: any) {
      toast({ title: 'Failed to archive conversation', description: error.message, variant: 'destructive' });
    }
  };

  const handleSetPriority = async (priority: 'low' | 'normal' | 'high' | 'urgent') => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from('conversations' as any)
        .update({ priority } as any)
        .eq('id', conversationId);

      if (error) throw error;

      toast({ title: 'Success', description: `Priority set to ${priority}` });
      fetchConversations();
    } catch (error: any) {
      toast({ title: 'Failed to set priority', description: error.message, variant: 'destructive' });
    }
  };

  const activeConversation = conversations.find(c => c.id === conversationId) || null;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <LeftPane
          userType={userType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          channel={channel}
          onChannelChange={setChannel}
          onNewConversation={() => setIsModalOpen(true)}
        />
        
        <ConversationsList
          conversations={conversations}
          activeConversationId={conversationId || null}
          onSelectConversation={handleConversationSelect}
          userType={userType}
        />
        
        <ChatPane
          conversation={activeConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          userType={userType}
          isSending={isSending}
          onResolve={userType === 'team' ? handleResolve : undefined}
          onArchive={userType === 'team' ? handleArchive : undefined}
          onSetPriority={userType === 'team' ? handleSetPriority : undefined}
        />
      </div>

      <CreateConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userType={userType}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
};
