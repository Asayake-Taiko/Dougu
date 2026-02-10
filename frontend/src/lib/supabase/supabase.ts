import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
