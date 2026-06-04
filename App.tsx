import React, { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { supabase } from "./src/supabase/supabase";

export default function App() {
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (state: AppStateStatus) => {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) return;

        try {
          await supabase
            .from("users")
            .update({
              online: state === "active",
              last_seen: new Date().toISOString(),
            })
            .eq("id", user.id);
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
