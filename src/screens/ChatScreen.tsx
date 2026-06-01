import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { auth, db } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatScreen({ route }: any) {
  const { user } = route.params;

  const currentUser = auth.currentUser;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  // CHAT ID (unique between 2 users)
  const chatId =
    currentUser!.uid > user.id
      ? `${currentUser!.uid}_${user.id}`
      : `${user.id}_${currentUser!.uid}`;

  // REAL-TIME LISTENER
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, []);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: message,
        senderId: currentUser?.uid,
        createdAt: serverTimestamp(),
      });

      setMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }: any) => {
    const isMe = item.senderId === currentUser?.uid;

    return (
      <View
        style={[
          styles.messageBox,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.name}>{user.name}</Text>
      </View>

      {/* CHAT */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatArea}
      />

      {/* INPUT */}
      <View style={styles.inputBox}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message..."
          placeholderTextColor="#6b7280"
          style={styles.input}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "#000", fontWeight: "bold" }}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
  },

  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    alignItems: "center",
  },

  name: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "bold",
  },

  chatArea: {
    padding: 15,
  },

  messageBox: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: "75%",
  },

  myMessage: {
    backgroundColor: "#38bdf8",
    alignSelf: "flex-end",
  },

  otherMessage: {
    backgroundColor: "#111827",
    alignSelf: "flex-start",
  },

  messageText: {
    color: "#fff",
  },

  inputBox: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },

  input: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 10,
    color: "#fff",
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#38bdf8",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 10,
  },
});