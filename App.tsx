import React, { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { auth, db } from "./src/services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function App() {
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (state: AppStateStatus) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
          await setDoc(
            doc(db, "users", user.uid),
            {
              online: state === "active",
              lastSeen: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (error) {
          console.log("AppState update error:", error);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}