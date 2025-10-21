import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface Message {
  id: string;
  sender_type: string;
  message_text: string;
  created_at: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  settings: WidgetSettings;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, settings }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full p-4">
      <div ref={scrollRef} className="space-y-4">
        {messages.map((message) => {
          const isInvestor = message.sender_type === 'investor';
          const isSystem = message.sender_type === 'system';
          
          if (isSystem) {
            return (
              <div key={message.id} className="flex justify-center">
                <p className="text-sm text-muted-foreground italic">
                  {message.message_text}
                </p>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${isInvestor ? 'justify-end' : 'justify-start'}`}
            >
              {!isInvestor && (
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[80%]`}>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isInvestor
                      ? 'rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                  style={isInvestor ? {
                    backgroundColor: `${settings.primary_color}1A`, // 10% opacity
                    border: `1px solid ${settings.primary_color}33`, // 20% opacity
                    color: 'hsl(var(--foreground))'
                  } : {}}
                >
                  <p className="text-sm">{message.message_text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-2">
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
        {isLoading && settings.enable_typing_indicators && (
          <div className="flex justify-start">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl px-4 py-2 rounded-bl-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
