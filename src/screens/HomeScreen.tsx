import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, auth } from "../services/firebase";

type UserItem = {
  id: string;
  email: string;
  online?: boolean;
};

export default function HomeScreen({ navigation }: any) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "users"),
      where("uid", "!=", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setUsers(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CHATTU</Text>

      {loading ? (
        <Text style={styles.info}>Loading users...</Text>
      ) : users.length === 0 ? (
        <Text style={styles.info}>No users available</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.user}
              onPress={() =>
                navigation.navigate("Chat", { userId: item.id })
              }
            >
              <Text style={styles.name}>{item.email}</Text>
              <Text style={{ color: item.online ? "green" : "gray" }}>
                {item.online ? "Online" : "Offline"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  user: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  info: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
});