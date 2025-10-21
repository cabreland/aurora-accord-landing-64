import React from 'react';
import { useChatWidget } from '@/hooks/useChatWidget';
import { ChatButton } from './ChatButton';
import { ChatPanel } from './ChatPanel';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

export const FloatingChatWidget: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const {
    isOpen,
    closeWidget,
    messages,
    unreadCount,
    currentDealContext,
    sendMessage,
    markAsRead,
    isLoading,
    settings
  } = useChatWidget();

  // Hide widget on auth pages
  const isAuthPage = location.pathname.startsWith('/auth') || 
                     location.pathname === '/' || 
                     location.pathname === '/v2';

  // Don't render if not authenticated or on auth pages
  if (!user || isAuthPage || !settings) {
    return null;
  }

  // Get position styles based on settings
  const getPositionStyles = () => {
    const base = 'fixed z-[9999]';
    const position = settings.widget_position === 'bottom-left' 
      ? 'bottom-6 left-6' 
      : 'bottom-6 right-6';
    return `${base} ${position}`;
  };

  return (
    <div className={getPositionStyles()}>
      {!isOpen && (
        <ChatButton
          onClick={() => {}} // Handled by useChatWidget
          unreadCount={unreadCount}
          settings={settings}
        />
      )}

      {isOpen && (
        <ChatPanel
          messages={messages}
          onClose={closeWidget}
          onSendMessage={sendMessage}
          dealContext={currentDealContext}
          onMarkAsRead={markAsRead}
          isLoading={isLoading}
          settings={settings}
        />
      )}
    </div>
  );
};
