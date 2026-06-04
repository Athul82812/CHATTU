export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  createdAt?: any;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export interface Chat {
  id: string;
  participant1: string;
  participant2: string;
  lastMessage?: string;
  updatedAt?: any;
}
