import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Send, MessageSquare, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id: string;
  investor_id: string;
  deal_id: string | null;
  deal_name: string | null;
  subject: string;
  last_message_at: string;
  unread_count_broker: number;
  unread_count_investor: number;
  status: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message_text: string;
  created_at: string;
}

const BrokerInbox = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load conversations
  useEffect(() => {
    loadConversations();

    // Real-time subscription
    const channel = supabase
      .channel('broker-inbox')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages'
      }, () => {
        loadConversations();
        if (selectedConversation) {
          loadMessages(selectedConversation.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark as read
      await supabase
        .from('conversations')
        .update({ unread_count_broker: 0 })
        .eq('id', conversationId);

      loadConversations(); // Refresh list
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          sender_type: 'broker',
          message_type: 'reply',
          message_text: replyText
        });

      if (error) throw error;

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          unread_count_investor: (selectedConversation.unread_count_investor || 0) + 1
        })
        .eq('id', selectedConversation.id);

      setReplyText('');
      loadMessages(selectedConversation.id);
      toast.success('Reply sent');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedConversation) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'resolved' })
        .eq('id', selectedConversation.id);

      if (error) throw error;

      toast.success('Conversation marked as resolved');
      setSelectedConversation(null);
      loadConversations();
    } catch (error) {
      console.error('Error marking as resolved:', error);
      toast.error('Failed to mark as resolved');
    }
  };

  return (
    <DashboardLayout activeTab="conversations">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))]">Chat Inbox</h1>
          <p className="text-[hsl(var(--text-primary))]/70">
            Manage investor conversations from the chat widget
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>
                {conversations.filter(c => c.status === 'active').length} active
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>I</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{conversation.subject}</p>
                          {conversation.deal_name && (
                            <p className="text-xs text-muted-foreground">
                              Re: {conversation.deal_name}
                            </p>
                          )}
                        </div>
                      </div>
                      {conversation.unread_count_broker > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unread_count_broker}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conversation.last_message_at), 'MMM d, HH:mm')}
                    </p>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No conversations yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedConversation.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {selectedConversation.deal_name && (
                          <>
                            Regarding: {selectedConversation.deal_name}
                            {selectedConversation.deal_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/deal/${selectedConversation.deal_id}`)}
                                className="h-6 px-2"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Deal
                              </Button>
                            )}
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAsResolved}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[500px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === 'broker' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender_type !== 'broker' && (
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>I</AvatarFallback>
                            </Avatar>
                          )}
                          <div className="max-w-[80%]">
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                message.sender_type === 'broker'
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-muted rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm">{message.message_text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 px-2">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Reply Input */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      disabled={sending}
                      className="min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sending}
                      size="icon"
                      className="shrink-0 h-[80px] w-[80px]"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground p-8">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrokerInbox;
