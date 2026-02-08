import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

export const createClient = (token?: string) => {
  const options = token ? {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  } : {};
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
}

export const supabase = createClient();
