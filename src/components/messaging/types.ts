export interface Participant {
  id: string;
  name: string;
  avatar: string | null;
  role?: string;
}

export interface ConversationType {
  id: string;
  subject: string;
  dealId?: string;
  dealName?: string;
  investorId: string;
  participants: Participant[];
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  channel: string;
  messageType?: string;
  status: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  archivedAt?: string;
  assignedTo?: string;
}

export interface MessageType {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'investor' | 'broker' | 'admin' | 'system';
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
  messageType?: string;
}

export type UserType = 'investor' | 'team';
export type FilterType = 'all' | 'unread' | 'deal-specific' | 'general' | 'urgent' | 'high-priority' | 'resolved' | 'archived';
export type ChannelType = 'all' | 'platform' | 'email' | 'phone';
