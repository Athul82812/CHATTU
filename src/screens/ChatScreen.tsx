import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import { supabase } from "../supabase/supabase";
import {
  sendMessage,
  subscribeToMessages,
} from "../services/chatService";

export default function ChatScreen({ route, navigation }: any) {
  const { chatId, userId: paramUserId, userName: paramUserName, otherUserName } = route.params;
  const [userId, setUserId] = useState(paramUserId);
  const [userName, setUserName] = useState(paramUserName);

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

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

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage(chatId, text, userId, userName);
    setText("");
  };

  const renderItem = ({ item }: any) => {
    const isMe = item.senderId === userId;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMe && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}

        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
          {item.text}
        </Text>
      </View>
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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
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

  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "75%",
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4f46e5",
  },

  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },

  messageText: {
    fontSize: 16,
  },

  myMessageText: {
    color: "#fff",
  },

  otherMessageText: {
    color: "#000",
  },

  senderName: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },

  sendButton: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },

  sendText: {
    color: "#fff",
    fontWeight: "bold",
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
