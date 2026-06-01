import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function ChatScreen({ route }: any) {
  const { userId } = route.params;

  const myId = auth.currentUser?.uid;
  if (!myId) return null; // 🛡️ prevent crash

  // 🔐 stable chatId
  const chatId =
    myId < userId ? `${myId}_${userId}` : `${userId}_${myId}`;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // 🔹 ensure chat document exists
  useEffect(() => {
    const ensureChat = async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        const snap = await getDoc(chatRef);

        if (!snap.exists()) {
          await setDoc(chatRef, {
            users: [myId, userId],
            createdAt: serverTimestamp(),
            lastMessage: "",
            updatedAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.log("ensureChat error:", e);
      }
    };

    ensureChat();
  }, [chatId]);

  // 🔥 load messages
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(data);

      // 👀 mark received messages as seen
      data.forEach((msg: any) => {
        if (msg.senderId !== myId && !msg.seen) {
          updateDoc(
            doc(db, "chats", chatId, "messages", msg.id),
            { seen: true }
          );
        }
      });
    });

    return unsub;
  }, [chatId]);

  // 📩 send message
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: message,
        senderId: myId,
        createdAt: serverTimestamp(),
        seen: false,
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: message,
        updatedAt: serverTimestamp(),
      });

      setMessage("");
    } catch (e) {
      Alert.alert("Error", "Message not sent");
    }
  };

  // ❌ delete message (soft delete)
  const deleteMessage = (id: string) => {
    Alert.alert("Delete", "Delete this message?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await updateDoc(
              doc(db, "chats", chatId, "messages", id),
              { text: "❌ Message deleted" }
            );
          } catch (e) {
            console.log("delete error:", e);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(i) => i.id}
        onContentSizeChange={() =>
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: true }),
            100
          )
        }
        renderItem={({ item }) => {
          const isMe = item.senderId === myId;

          return (
            <TouchableOpacity
              onLongPress={() => deleteMessage(item.id)}
              style={[styles.msg, isMe ? styles.me : styles.other]}
            >
              <Text style={styles.text}>{item.text}</Text>
              {isMe && (
                <Text style={styles.seen}>
                  {item.seen ? "✓✓ Seen" : "✓ Sent"}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.row}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <TouchableOpacity style={styles.btn} onPress={sendMessage}>
          <Text style={{ fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 10,
  },
  msg: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: "75%",
  },
  me: {
    backgroundColor: "#38bdf8",
    alignSelf: "flex-end",
  },
  other: {
    backgroundColor: "#111827",
    alignSelf: "flex-start",
  },
  text: { color: "#fff" },
  seen: {
    fontSize: 10,
    color: "#e5e7eb",
    marginTop: 4,
    textAlign: "right",
  },
  row: { flexDirection: "row", marginTop: 10 },
  input: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 10,
    color: "#fff",
  },
  btn: {
    backgroundColor: "#38bdf8",
    padding: 10,
    marginLeft: 8,
    borderRadius: 10,
  },
});