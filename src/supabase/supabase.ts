import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://tjacksqlwtfzwsaumkzg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYWNrc3Fsd3RmendzYXVta3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjM2NDMsImV4cCI6MjA5NjAzOTY0M30.TPlcTlo6bfsKE7zS9XoGRgZBHaOQzdzmA0xYNnuzURI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
