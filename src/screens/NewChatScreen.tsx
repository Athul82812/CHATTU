import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
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

export default function NewChatScreen({ navigation }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get logged-in user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
  }, []);

  // Load users
  useEffect(() => {
    if (!currentUser) return;

    const loadUsers = async () => {
      setLoading(true);

      let query = supabase
        .from("users")
        .select("id, name, photo_url, online, last_seen")
        .neq("id", currentUser.id);

      if (search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }

      const { data, error } = await query.order("name");

      if (error) {
        console.error("Error fetching users:", error.message);
        setLoading(false);
        return;
      }

      setUsers(data ?? []);
      setLoading(false);
    };

    loadUsers();
  }, [currentUser, search]);

  // Start or open chat
  const startChat = async (otherUser: any) => {
    if (!currentUser) return;

    const uid1 = currentUser.id;
    const uid2 = otherUser.id;

    // Stable chat id
    const chatId = uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

    // Check existing chat
    const { data: existing } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .maybeSingle();

    // Create chat if not exists
    if (!existing) {
      const { error } = await supabase.from("chats").insert({
        id: chatId,
        participant1: uid1,
        participant2: uid2,
        last_message: "",
      });

      if (error) {
        console.error("Create chat error:", error.message);
        return;
      }
    }

    navigation.replace("Chat", {
      chatId,
      userId: currentUser.id,
      userName: currentUser.user_metadata?.full_name || currentUser.email || "User",
      otherUserId: otherUser.id,
      otherUserName: otherUser.name || "User",
    });
  };

  const renderItem = ({ item }: any) => {
    const avatarColor = getAvatarColor(item.id);
    const initial = item.name?.charAt(0)?.toUpperCase() || "?";

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => startChat(item)}
      >
        {item.photo_url ? (
          <Image source={{ uri: item.photo_url }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: avatarColor },
            ]}
          >
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || "User"}</Text>
          <Text style={styles.userStatus}>
            {item.online ? "🟢 Online" : "Offline"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Chat</Text>
        <View style={{ width: 50 }} />
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search users..."
        placeholderTextColor="#6b7280"
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <Text style={styles.empty}>Loading users...</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No users found</Text>
          }
        />
      )}
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backBtn: {
    color: "#38bdf8",
    fontSize: 16,
    minWidth: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  search: {
    backgroundColor: "#111827",
    color: "#fff",
    marginHorizontal: 15,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  userCard: {
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
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  userStatus: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 50,
  },
});