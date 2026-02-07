import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { PowerSyncDatabase } from "@powersync/node";
import { uploadToSupabase } from "../../../src/lib/powersync/SupabaseUploader";
import { SUPABASE_KEY, SUPABASE_URL, POWERSYNC_URL } from "./env";
import { AppSchema } from "../../../src/lib/powersync/schema";

// Export factory for tests to use if needed
export const createClient = (token?: string) => {
  const options = token
    ? {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    : {};
  return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, options);
};

// Default admin/anon client
export const supabase = createClient();

export async function createPowerSyncClient(token: string, dbFilename: string) {
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: dbFilename,
    },
  });

  await db.init();

  await db.connect({
    fetchCredentials: async () => {
      return {
        endpoint: POWERSYNC_URL,
        token: token,
      };
    },
    uploadData: async (database) => {
      const transaction = await database.getNextCrudTransaction();
      if (!transaction) {
        return;
      }

      const supabaseClient = createClient(token);

      await uploadToSupabase(supabaseClient, transaction);
    },
  });

  return db;
}
