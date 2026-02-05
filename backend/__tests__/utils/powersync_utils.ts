import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { PowerSyncDatabase } from "@powersync/node";
import { AppSchema } from "@dougu/shared";
import { SUPABASE_KEY, SUPABASE_URL, POWERSYNC_URL } from "./env";

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