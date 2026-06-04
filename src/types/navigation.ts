export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  NewChat: undefined;
  Chat: {
    chatId: string;
    userId: string;
    userName: string;
    otherUserName: string;
    otherUserId?: string;
  };
  Profile: undefined;
};
