import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, ExternalLink, CheckCircle2, Archive, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { MessageType, ConversationType, UserType } from './types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatPaneProps {
  conversation: ConversationType | null;
  messages: MessageType[];
  onSendMessage: (content: string) => void;
  userType: UserType;
  isSending: boolean;
  onResolve?: () => void;
  onArchive?: () => void;
  onSetPriority?: (priority: 'low' | 'normal' | 'high' | 'urgent') => void;
}

export const ChatPane = ({ 
  conversation, 
  messages, 
  onSendMessage, 
  userType, 
  isSending,
  onResolve,
  onArchive,
  onSetPriority
}: ChatPaneProps) => {
  const [messageContent, setMessageContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent);
      setMessageContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="w-2/5 flex items-center justify-center text-muted-foreground">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="w-2/5 flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{conversation.subject}</h3>
            {userType === 'team' && conversation.participants.length > 0 && (
              <p className="text-sm text-muted-foreground">
                with {conversation.participants[0].name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {conversation.status === 'resolved' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Resolved
              </Badge>
            )}
            {conversation.dealName && (
              <Badge variant="outline">{conversation.dealName}</Badge>
            )}
            {conversation.dealId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/deal/${conversation.dealId}`)}
              >
                View Deal
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
            {userType === 'team' && (
              <>
                {onSetPriority && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        {conversation.priority || 'normal'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onSetPriority('low')}>
                        Low Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSetPriority('normal')}>
                        Normal Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSetPriority('high')}>
                        High Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSetPriority('urgent')}>
                        Urgent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {onResolve && conversation.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResolve}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Resolve
                  </Button>
                )}
                {onArchive && !conversation.archivedAt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onArchive}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.isMe ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <Avatar>
                <AvatarFallback>{message.senderInitials}</AvatarFallback>
              </Avatar>
              <div className={cn('flex-1 max-w-[70%]', message.isMe ? 'items-end' : 'items-start')}>
                <div className={cn(
                  'rounded-lg p-3',
                  message.isMe 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(message.timestamp, 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[80px]"
          />
          <Button onClick={handleSend} disabled={isSending || !messageContent.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
