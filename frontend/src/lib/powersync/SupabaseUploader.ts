import { SupabaseClient } from "@supabase/supabase-js";
import { CrudTransaction } from "@powersync/common";

/**
 * Shared logic for uploading PowerSync CRUD transactions to Supabase.
 * This can be used by both the React Native Connector and Node.js test utilities.
 */
export async function uploadToSupabase(
  supabaseClient: SupabaseClient,
  transaction: CrudTransaction,
): Promise<void> {
  try {
    for (const op of transaction.crud) {
      const table = op.table;
      const record = op.opData || {};
      const id = op.id;

      // The data that needs to be changed in the remote db
      switch (op.op) {
        case "PUT":
          // Instruct supabase to CREATE or UPDATE a record
          const { error: putError } = await supabaseClient
            .from(table)
            .upsert({ ...record, id });
          if (putError) throw putError;
          break;
        case "PATCH":
          // Instruct supabase to PATCH a record
          const { error: patchError } = await supabaseClient
            .from(table)
            .update(record)
            .eq("id", id);
          if (patchError) throw patchError;
          break;
        case "DELETE":
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
