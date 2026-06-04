import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { supabase } from "../supabase/supabase";

const AVATAR_COLORS = [
  "#4f46e5",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#2563eb",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "short" });

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function HomeScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get logged-in user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
  }, []);

  // Load chats
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.id;

    const loadChats = async () => {
      const { data: chatsData, error } = await supabase
        .from("chats")
        .select("*")
        .or(`participant1.eq.${uid},participant2.eq.${uid}`)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching chats:", error.message);
        return;
      }

      if (!chatsData || chatsData.length === 0) {
        setChats([]);
        return;
      }

      const otherIds = chatsData.map((c) =>
        c.participant1 === uid ? c.participant2 : c.participant1
      );

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name, photo_url, online, last_seen")
        .in("id", otherIds);

      if (usersError) {
        console.error("Error fetching users:", usersError.message);
        return;
      }

      const userMap = new Map(usersData?.map((u) => [u.id, u]));

      const enriched = chatsData.map((c) => ({
        ...c,
        otherUser: userMap.get(
          c.participant1 === uid ? c.participant2 : c.participant1
        ),
      }));

      setChats(enriched);
    };

    loadChats();

    const channel = supabase
      .channel("home_chats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats" },
        loadChats
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const openChat = (item: any) => {
    navigation.navigate("Chat", {
      chatId: item.id,
      userId: currentUser.id,
      userName: currentUser.user_metadata?.full_name || currentUser.email || "User",
      otherUserId: item.otherUser?.id,
      otherUserName: item.otherUser?.name || "User",
    });
  };

  const renderItem = ({ item }: any) => {
    const otherUser = item.otherUser || {};
    const name = otherUser.name || "User";
    const avatarColor = getAvatarColor(otherUser.id || item.id);

    return (
      <TouchableOpacity style={styles.chatCard} onPress={() => openChat(item)}>
        {otherUser.photo_url ? (
          <Image source={{ uri: otherUser.photo_url }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: avatarColor },
            ]}
          >
            <Text style={styles.avatarInitial}>{name[0]}</Text>
          </View>
        )}

        <View style={styles.chatInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {otherUser.online && <View style={styles.onlineDot} />}
          </View>

          <Text style={styles.message} numberOfLines={1}>
            {item.last_message || "No messages yet"}
          </Text>
        </View>

        {item.updated_at && (
          <Text style={styles.time}>{formatTime(item.updated_at)}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CHATTU</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("NewChat")}
            style={styles.newChatBtn}
          >
            <Text style={styles.newChatIcon}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.profileBtn}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No chats yet{"\n"}Tap + to start a new conversation
          </Text>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  newChatBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
  },
  newChatIcon: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
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
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  message: {
    color: "#9ca3af",
    marginTop: 3,
  },
  time: {
    color: "#6b7280",
    fontSize: 12,
    marginLeft: 8,
  },
  empty: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 50,
    lineHeight: 24,
  },
});