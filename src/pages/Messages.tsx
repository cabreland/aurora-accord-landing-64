import React, { useState } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useInvestorMessages } from '@/hooks/useInvestorMessages';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const Messages = () => {
  const navigate = useNavigate();
  const { messages, unreadCount, loading, sendMessage, markAsRead } = useInvestorMessages();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleReply = async (recipientId: string, dealId: string | null) => {
    if (!replyMessage.trim()) return;

    await sendMessage(recipientId, replyMessage, dealId || undefined);
    setReplyMessage('');
    setReplyTo(null);
  };

  return (
    <div className="min-h-screen bg-[#1C2526] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Button 
          onClick={() => navigate('/investor-portal')}
          className="mb-4 bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portal
        </Button>

        <Card className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] border-[#D4AF37]/30">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#FAFAFA] mb-2">Messages</h1>
                <p className="text-xl text-[#F4E4BC]">
                  {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
                </p>
              </div>
              <MessageSquare className="w-12 h-12 text-[#D4AF37]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-[#D4AF37]/20 rounded mb-2"></div>
                <div className="h-4 bg-[#F4E4BC]/20 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ) : messages.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
              <p className="text-[#F4E4BC]/60 text-lg">No messages yet</p>
              <p className="text-[#F4E4BC]/40 text-sm mt-2">
                Ask questions about deals to start a conversation with the broker team
              </p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card 
              key={message.id} 
              className={`bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all ${
                !message.read_at ? 'border-[#F28C38]' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#FAFAFA] text-lg">
                    {!message.read_at && (
                      <span className="inline-block w-2 h-2 bg-[#F28C38] rounded-full mr-2 animate-pulse"></span>
                    )}
                    Message Thread
                  </CardTitle>
                  <span className="text-sm text-[#F4E4BC]/60">
                    {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[#F4E4BC] whitespace-pre-wrap">{message.message}</p>
                
                {replyTo === message.id ? (
                  <div className="space-y-2 mt-4 pt-4 border-t border-[#D4AF37]/20">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="bg-[#1A1F2E] border-[#D4AF37]/20 text-[#FAFAFA]"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReply(message.sender_id, message.deal_id)}
                        className="bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#F4E4BC]"
                      >
                        Send Reply
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyMessage('');
                        }}
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[#D4AF37]/20">
                    <Button
                      size="sm"
                      onClick={() => setReplyTo(message.id)}
                      className="bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
                    >
                      Reply
                    </Button>
                    {!message.read_at && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(message.id)}
                        className="text-[#F4E4BC] hover:text-[#D4AF37]"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;
