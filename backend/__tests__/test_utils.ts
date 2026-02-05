import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { PowerSyncDatabase } from "@powersync/node";
import 'dotenv/config';
import { AppSchema } from "./schema";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "";
const POWERSYNC_URL = "http://127.0.0.1:8080";

// Export factory for tests to use if needed
export const createClient = (token?: string) => {
  const options = token ? {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  } : {};
  return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, options);
}

// Default admin/anon client
export const supabase = createClient();

export async function createPowerSyncClient(token: string, dbFilename: string) {
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: dbFilename
    }
  });

  await db.init();

  await db.connect({
    fetchCredentials: async () => {
      return {
        endpoint: POWERSYNC_URL,
        token: token
      };
    },
    uploadData: async (database) => {
      return;
    }
  });

  return db;
}

export async function generateTestUser() {
  const email = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const password = "password123";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error("User not created");

  // Sign in to get the session token
  const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (sessionError) throw sessionError;

  return { user: data.user, token: sessionData.session.access_token };
}
