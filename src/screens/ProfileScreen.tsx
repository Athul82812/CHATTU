import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase/supabase";

export default function ProfileScreen({ navigation }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("name, photo_url")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }

        if (data) {
          setProfile(data);
          if (data.photo_url) setImage(data.photo_url);
        }
      } catch (e) {
        console.error("Unexpected error fetching profile:", e);
      }
    };

    loadProfile();
  }, [user?.id]);

  const pickImage = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      setLoading(true);

      const uri = result.assets[0].uri;
      const blob = await (await fetch(uri)).blob();

      const filePath = `public/${user.id}.jpg`;
      await supabase.storage.from("profiles").upload(filePath, blob, {
        upsert: true,
      });

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      const downloadURL = urlData?.publicUrl;
      if (downloadURL) setImage(downloadURL);

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("users")
          .update({ photo_url: downloadURL })
          .eq("id", user.id);
      } else {
        await supabase.from("users").insert({
          id: user.id,
          photo_url: downloadURL,
          email: user.email,
        });
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {image ? (
        <Image source={{ uri: image }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{initial}</Text>
        </View>
      )}

      <Text style={styles.displayName}>{displayName}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {loading ? (
        <ActivityIndicator color="#38bdf8" style={{ marginTop: 15 }} />
      ) : (
        <TouchableOpacity style={styles.btn} onPress={pickImage}>
          <Text style={styles.btnText}>Upload Photo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  placeholderText: {
    color: "#fff",
    fontSize: 44,
    fontWeight: "bold",
  },
  displayName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#38bdf8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 5,
  },
  btnText: { color: "#000", fontWeight: "bold" },
  logout: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});
