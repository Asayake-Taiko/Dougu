import "dotenv/config";

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
export const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
export const POWERSYNC_URL =
  process.env.EXPO_PUBLIC_POWERSYNC_URL || "http://127.0.0.1:8080";
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
