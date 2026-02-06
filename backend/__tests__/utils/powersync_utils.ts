import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { PowerSyncDatabase } from "@powersync/node";
import { AppSchema } from "./schema";
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
      const transaction = await database.getNextCrudTransaction();
      if (!transaction) {
        return;
      }

      const supabaseClient = createClient(token);

      try {
        for (const op of transaction.crud) {
          const table = op.table;
          const record = op.opData || {};
          const id = op.id;

          // The data that needs to be changed in the remote db
          // This mirrors the frontend Connector's uploadData implementation
          switch (op.op) {
            case 'PUT':
              // Instruct supabase to CREATE or UPDATE a record
              const { error: putError } = await supabaseClient
                .from(table)
                .upsert({ ...record, id });
              if (putError) throw putError;
              break;
            case 'PATCH':
              // Instruct supabase to PATCH a record
              const { error: patchError } = await supabaseClient
                .from(table)
                .update(record)
                .eq("id", id);
              if (patchError) throw patchError;
              break;
            case 'DELETE':
              // Instruct supabase to DELETE a record
              const { error: deleteError } = await supabaseClient
                .from(table)
                .delete()
                .eq("id", id);
              if (deleteError) throw deleteError;
              break;
          }
        }

        // Completes the transaction and moves onto the next one
        await transaction.complete();
      } catch (error) {
        console.error("Error uploading data to Supabase:", error);
        throw error;
      }
    }
  });

  return db;
}