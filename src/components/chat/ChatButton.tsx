import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount: number;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick, unreadCount }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-16 h-16 rounded-full",
        "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-200",
        "flex items-center justify-center",
        "group"
      )}
      aria-label="Open chat"
    >
      <MessageSquare className="w-7 h-7 text-white" />
      
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-6 min-w-6 px-1.5 flex items-center justify-center bg-red-500 text-white border-2 border-white"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </button>
  );
};
