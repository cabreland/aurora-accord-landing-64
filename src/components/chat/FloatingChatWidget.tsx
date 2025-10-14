import React, { useEffect } from 'react';
import { useChatWidget } from '@/hooks/useChatWidget';
import { ChatButton } from './ChatButton';
import { ChatPanel } from './ChatPanel';

interface FloatingChatWidgetProps {
  currentDealId?: string;
  currentDealName?: string;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  currentDealId,
  currentDealName
}) => {
  const {
    isOpen,
    toggleWidget,
    messages,
    unreadCount,
    currentDealContext,
    sendMessage,
    markAsRead,
    isLoading
  } = useChatWidget();

  return (
    <>
      {!isOpen && (
        <ChatButton
          onClick={toggleWidget}
          unreadCount={unreadCount}
        />
      )}

      {isOpen && (
        <ChatPanel
          messages={messages}
          onClose={toggleWidget}
          onSendMessage={sendMessage}
          dealContext={currentDealContext}
          onMarkAsRead={markAsRead}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
