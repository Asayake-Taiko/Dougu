import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";

// In Expo background tasks, we need to use expo/fetch for reliable network requests.
// However, expo/fetch is not compatible with Node.js environments used in vitest.
const getFetch = () => {
  if (typeof process !== "undefined" && process.env.VITEST) {
    return fetch;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo/fetch").fetch;
  } catch {
    return fetch;
  }
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: getFetch() as any,
    },
  },
);

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. This prevents Android from killing the
// JS background timer and causing token expiration.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
