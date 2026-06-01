export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Arjun Menon',
    avatar: 'A',
    lastMessage: 'Hey! Are you free this evening?',
    lastMessageTime: '10:42 AM',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Priya Nair',
    avatar: 'P',
    lastMessage: 'The meeting is rescheduled to 3 PM',
    lastMessageTime: '9:15 AM',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Rahul Krishnan',
    avatar: 'R',
    lastMessage: 'Thanks for the help yesterday 🙏',
    lastMessageTime: 'Yesterday',
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Sneha Pillai',
    avatar: 'S',
    lastMessage: 'Can you share the document?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Dev Team',
    avatar: 'D',
    lastMessage: 'Build is passing ✅',
    lastMessageTime: 'Mon',
    unreadCount: 0,
    isOnline: true,
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      text: 'Hey! How are you doing?',
      senderId: '1',
      senderName: 'Arjun Menon',
      timestamp: new Date(Date.now() - 3600000 * 2),
      isRead: true,
    },
    {
      id: 'm2',
      text: "I'm doing great! Just finished the new project.",
      senderId: 'me',
      senderName: 'Me',
      timestamp: new Date(Date.now() - 3600000 * 1.5),
      isRead: true,
    },
    {
      id: 'm3',
      text: "That's awesome! What was it about?",
      senderId: '1',
      senderName: 'Arjun Menon',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
    },
    {
      id: 'm4',
      text: 'A mobile chat app called CHATTU — built with React Native and Expo!',
      senderId: 'me',
      senderName: 'Me',
      timestamp: new Date(Date.now() - 1800000),
      isRead: true,
    },
    {
      id: 'm5',
      text: "Wow, that sounds really cool! 🚀 I'd love to try it.",
      senderId: '1',
      senderName: 'Arjun Menon',
      timestamp: new Date(Date.now() - 900000),
      isRead: true,
    },
    {
      id: 'm6',
      text: 'Hey! Are you free this evening?',
      senderId: '1',
      senderName: 'Arjun Menon',
      timestamp: new Date(Date.now() - 300000),
      isRead: false,
    },
  ],
  '2': [
    {
      id: 'm1',
      text: 'Good morning! Quick heads up — the meeting is rescheduled to 3 PM.',
      senderId: '2',
      senderName: 'Priya Nair',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
    },
    {
      id: 'm2',
      text: 'Got it, thanks for letting me know!',
      senderId: 'me',
      senderName: 'Me',
      timestamp: new Date(Date.now() - 3500000),
      isRead: true,
    },
  ],
  '3': [
    {
      id: 'm1',
      text: "Thanks for the help yesterday 🙏 Really saved me!",
      senderId: '3',
      senderName: 'Rahul Krishnan',
      timestamp: new Date(Date.now() - 86400000),
      isRead: false,
    },
  ],
  '4': [
    {
      id: 'm1',
      text: 'Hey, can you share the onboarding document?',
      senderId: '4',
      senderName: 'Sneha Pillai',
      timestamp: new Date(Date.now() - 86400000),
      isRead: true,
    },
    {
      id: 'm2',
      text: "Sure, I'll send it shortly!",
      senderId: 'me',
      senderName: 'Me',
      timestamp: new Date(Date.now() - 85000000),
      isRead: true,
    },
  ],
  '5': [
    {
      id: 'm1',
      text: 'All tests passing. Deploying to staging now.',
      senderId: '5',
      senderName: 'Dev Team',
      timestamp: new Date(Date.now() - 172800000),
      isRead: true,
    },
    {
      id: 'm2',
      text: 'Build is passing ✅',
      senderId: '5',
      senderName: 'Dev Team',
      timestamp: new Date(Date.now() - 172800000 + 3600000),
      isRead: true,
    },
  ],
};

export const formatMessageTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${ampm}`;
};
