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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import { auth, db, storage } from "../services/firebase";

export default function ProfileScreen({ navigation }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;

    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setImage(snap.data().photoURL || null);
        }
      } catch (e) {
        console.log(e);
      }
    };

    loadProfile();
  }, [uid]);

  const pickImage = async () => {
    if (!uid) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      setLoading(true);

      const uri = result.assets[0].uri;
      const blob = await (await fetch(uri)).blob();

      const imageRef = ref(storage, `profile/${uid}.jpg`);
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      setImage(downloadURL);

      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        await updateDoc(userRef, { photoURL: downloadURL });
      } else {
        await setDoc(userRef, {
          uid,
          photoURL: downloadURL,
          email: user?.email,
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
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e: any) {
      console.log(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {image ? (
        <Image source={{ uri: image }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={{ color: "#aaa" }}>No Image</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#38bdf8" />
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
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#38bdf8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnText: { color: "#000", fontWeight: "bold" },
  logout: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});