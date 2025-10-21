import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  settings: WidgetSettings;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled, settings }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    await onSend(message);
    setMessage('');
    setIsSending(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[hsl(var(--border))]">
      <div className="flex items-end gap-2 p-4">
        {/* Optional Emoji Button */}
        {settings.enable_emojis && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mb-1"
            disabled={disabled}
          >
            <Smile className="w-5 h-5" />
          </Button>
        )}
        
        {/* Optional File Attachment Button */}
        {settings.enable_file_attachments && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mb-1"
            disabled={disabled}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        )}

        {/* Message Input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={settings.placeholder_text}
          disabled={disabled || isSending}
          className="min-h-[60px] max-h-[120px] resize-none flex-1"
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          size="icon"
          className="shrink-0 h-[60px] w-[60px]"
          style={{ backgroundColor: settings.primary_color }}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
