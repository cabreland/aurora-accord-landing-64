import React, { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { DealContextBadge } from './DealContextBadge';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface ChatPanelProps {
  messages: any[];
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  dealContext?: { id: string; name: string } | null;
  onMarkAsRead: () => void;
  isLoading?: boolean;
  settings: WidgetSettings;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onClose,
  onSendMessage,
  dealContext,
  onMarkAsRead,
  isLoading = false,
  settings
}) => {
  useEffect(() => {
    if (messages.length > 0) {
      onMarkAsRead();
    }
  }, [messages.length, onMarkAsRead]);

  // Get dimensions based on widget size
  const getDimensions = () => {
    switch (settings.widget_size) {
      case 'small': return 'w-[340px] h-[500px]';
      case 'large': return 'w-[420px] h-[650px]';
      default: return 'w-[380px] h-[600px]';
    }
  };

  // Show initial greeting if no messages
  const displayMessages = messages.length === 0 
    ? [{
        id: 'greeting',
        message_text: settings.initial_greeting,
        sender_type: 'system',
        created_at: new Date().toISOString()
      }]
    : messages;

  return (
    <Card className={`${getDimensions()} flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b text-white rounded-t-lg"
        style={{ backgroundColor: settings.primary_color }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{settings.widget_title}</h3>
            {settings.show_online_status && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-400 rounded-full" />
              </div>
            )}
          </div>
          {dealContext && (
            <DealContextBadge dealName={dealContext.name} />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={displayMessages} 
          isLoading={isLoading}
          settings={settings}
        />
      </div>

      {/* Input */}
      <MessageInput 
        onSend={onSendMessage} 
        disabled={isLoading}
        settings={settings}
      />
    </Card>
  );
};
