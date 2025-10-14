import React, { useEffect } from 'react';
import { X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { DealContextBadge } from './DealContextBadge';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  messages: any[];
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  dealContext?: { id: string; name: string } | null;
  onMarkAsRead: () => void;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onClose,
  onSendMessage,
  dealContext,
  onMarkAsRead,
  isLoading
}) => {
  useEffect(() => {
    onMarkAsRead();
  }, [messages]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-[380px] h-[600px]",
        "bg-[hsl(var(--background))] border border-[hsl(var(--border))]",
        "rounded-lg shadow-2xl",
        "flex flex-col",
        "animate-in slide-in-from-bottom-4 duration-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
        <div>
          <h3 className="font-semibold text-[hsl(var(--foreground))]">
            Chat with Broker Team
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Usually responds within minutes
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Deal Context */}
      {dealContext && (
        <div className="px-4 pt-4">
          <DealContextBadge dealName={dealContext.name} />
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
};
