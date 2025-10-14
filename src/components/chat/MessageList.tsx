import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message_text: string;
  created_at: string;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="text-[hsl(var(--muted-foreground))]">
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">Start a conversation with the broker team</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex",
                isOwn ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-4 py-2",
                  isOwn
                    ? "bg-[hsl(var(--primary))] text-white"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                )}
              >
                {!isOwn && (
                  <div className="text-xs font-medium mb-1 opacity-70">
                    Broker Team
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.message_text}
                </p>
                <div
                  className={cn(
                    "text-xs mt-1",
                    isOwn ? "text-white/70" : "text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {format(new Date(message.created_at), 'MMM d, h:mm a')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
