import React from 'react';
import { useChatWidget } from '@/contexts/ChatWidgetContext';
import { ChatButton } from './ChatButton';
import { ChatPanel } from './ChatPanel';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

export const FloatingChatWidget: React.FC = () => {
  console.log('[FloatingChatWidget] Component rendering');
  
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

  console.log('[FloatingChatWidget] State:', {
    hasUser: !!user,
    pathname: location.pathname,
    isOpen,
    hasSettings: !!settings,
    unreadCount
  });

  // Hide widget on auth pages
  const isAuthPage = location.pathname.startsWith('/auth') || 
                     location.pathname === '/' || 
                     location.pathname === '/v2';

  console.log('[FloatingChatWidget] isAuthPage:', isAuthPage);

  if (!user) {
    console.log('[FloatingChatWidget] No user - not rendering');
    return null;
  }
  
  if (isAuthPage) {
    console.log('[FloatingChatWidget] Auth page - not rendering');
    return null;
  }
  
  if (!settings) {
    console.log('[FloatingChatWidget] No settings loaded yet - not rendering');
    return null;
  }

  console.log('[FloatingChatWidget] Rendering widget, isOpen:', isOpen);

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
