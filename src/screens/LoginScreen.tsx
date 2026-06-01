import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await signInWithEmailAndPassword(auth, email, password);

      // Create / merge user document safely
      await setDoc(
        doc(db, "users", res.user.uid),
        {
          uid: res.user.uid,
          email: res.user.email,
          online: true,
          typing: false,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );

      // ❌ DO NOT navigate manually
      // AppNavigator will handle routing automatically
    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CHATTU 💬</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: "#38bdf8",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 10,
  },
  btnText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
});