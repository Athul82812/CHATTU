import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export default function HomeScreen({ navigation }: any) {
  const currentUser = auth.currentUser;
  const [chats, setChats] = useState<any[]>([]);

  // REAL FIREBASE CHAT LIST
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChats(data);
    });

    return unsubscribe;
  }, []);

  const openChat = (item: any) => {
    const otherUserId = item.participants.find(
      (id: string) => id !== currentUser?.uid
    );

    navigation.navigate("Chat", {
      chatId: item.id,
      otherUserId,
    });
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => openChat(item)}
    >
      <Image
        source={{ uri: "https://i.pravatar.cc/150" }}
        style={styles.avatar}
      />

      <View style={styles.chatInfo}>
        <Text style={styles.name}>
          Chat User
        </Text>

        <Text style={styles.message} numberOfLines={1}>
          {item.lastMessage || "No messages yet"}
        </Text>
      </View>

      <Text style={styles.time}>now</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>CHATTU</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.profileBtn}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT LIST */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No chats yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#38bdf8",
  },

  profileBtn: {
    color: "#38bdf8",
    fontWeight: "600",
  },

  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#111827",
    borderRadius: 16,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  message: {
    color: "#9ca3af",
    marginTop: 3,
  },

  time: {
    color: "#6b7280",
    fontSize: 12,
  },

  empty: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 50,
  },
});