import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import { supabase } from "../supabase/supabase";
import {
  sendMessage,
  sendAudioMessage,
  subscribeToMessages,
} from "../services/chatService";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";

export default function ChatScreen({ route, navigation }: any) {
  const { chatId, userId: paramUserId, userName: paramUserName, otherUserName } = route.params;
  const [userId, setUserId] = useState(paramUserId);
  const [userName, setUserName] = useState(paramUserName);

  const [messages, setMessages] = useState<any[]>([]);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!userId) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const user = session?.user;
        if (user) {
          setUserId(user.id);
          setUserName(user.user_metadata?.full_name || user.email || "User");
        }
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async (text: string) => {
    await sendMessage(chatId, text, userId, userName);
  };

  const handleSendAudio = async (uri: string, duration: number) => {
    await sendAudioMessage(chatId, uri, duration, userId, userName);
  };

  const renderItem = ({ item }: any) => {
    const isMe = item.senderId === userId;
    return (
      <MessageBubble
        text={item.text}
        isOwnMessage={isMe}
        timestamp={new Date(item.createdAt)}
        isRead={item.isRead}
        audioUrl={item.audioUrl}
        duration={item.duration}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {otherUserName || "Chat"}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          style={styles.listContainer}
        />
      )}

      <ChatInput onSend={handleSend} onSendAudio={handleSendAudio} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },

  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  backBtn: {
    color: "#4f46e5",
    fontSize: 16,
    fontWeight: "600",
    minWidth: 50,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#212121",
    flex: 1,
    textAlign: "center",
  },

  listContainer: {
    flex: 1,
  },

  list: {
    padding: 10,
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },

  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});
