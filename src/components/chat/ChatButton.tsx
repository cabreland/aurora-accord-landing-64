import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { useChatWidget } from '@/contexts/ChatWidgetContext';

interface ChatButtonProps {
  unreadCount: number;
  settings: WidgetSettings;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ unreadCount, settings }) => {
  const { toggleWidget } = useChatWidget();
  
  // Get size based on settings
  const getSizeClass = () => {
    switch (settings.widget_size) {
      case 'small': return 'h-[50px] w-[50px]';
      case 'large': return 'h-[70px] w-[70px]';
      default: return 'h-[60px] w-[60px]';
    }
  };

  // Get border radius based on bubble style
  const getBorderRadius = () => {
    return settings.bubble_style === 'rounded-square' ? 'rounded-2xl' : 'rounded-full';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleWidget}
            className={`${getSizeClass()} ${getBorderRadius()} shadow-lg hover:scale-105 transition-transform flex items-center justify-center relative`}
            style={{ 
              backgroundColor: settings.primary_color,
              color: '#ffffff'
            }}
            aria-label="Open chat"
          >
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{settings.minimized_tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
