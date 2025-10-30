import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ConversationType, UserType } from './types';
import { Flag } from 'lucide-react';

interface ConversationsListProps {
  conversations: ConversationType[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  userType: UserType;
}

export const ConversationsList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  userType
}: ConversationsListProps) => {
  const getMessageTypeBadgeColor = (type?: string) => {
    switch (type) {
      case 'question': return 'bg-blue-500/20 text-blue-700';
      case 'interest': return 'bg-amber-500/20 text-amber-700';
      case 'info_request': return 'bg-purple-500/20 text-purple-700';
      case 'call_request': return 'bg-green-500/20 text-green-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'low': return 'text-gray-400';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    if (priority === 'urgent' || priority === 'high') {
      return <Flag className={`h-3 w-3 ${getPriorityColor(priority)}`} fill="currentColor" />;
    }
    return null;
  };

  return (
    <div className="w-2/5 border-r">
      <ScrollArea className="h-full">
        <div className="divide-y">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                'p-4 cursor-pointer hover:bg-accent transition-colors border-l-4',
                activeConversationId === conversation.id
                  ? 'bg-accent border-l-primary'
                  : 'border-l-transparent'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 flex items-start gap-1">
                  {getPriorityIcon(conversation.priority)}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{conversation.subject}</p>
                    {userType === 'team' && conversation.participants.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {conversation.participants[0].name}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                  {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {conversation.status === 'resolved' && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                    Resolved
                  </Badge>
                )}
                {conversation.archivedAt && (
                  <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-600 border-gray-500/20">
                    Archived
                  </Badge>
                )}
                {conversation.dealName && (
                  <Badge variant="outline" className="text-xs">
                    {conversation.dealName}
                  </Badge>
                )}
                {conversation.messageType && (
                  <Badge className={cn('text-xs', getMessageTypeBadgeColor(conversation.messageType))}>
                    {conversation.messageType.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground truncate">
                {conversation.lastMessage}
              </p>

              {conversation.unread > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {conversation.unread} unread
                </Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
