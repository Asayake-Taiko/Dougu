import { SupabaseClient } from "@supabase/supabase-js";
import { CrudTransaction, CrudEntry, UpdateType } from "@powersync/common";

/**
 * Response codes that should not retry.
 * These indicate permanent errors that won't resolve with retries.
 */
const FATAL_RESPONSE_CODES = [
  /^22...$/, // Data exception (e.g., invalid data format)
  /^23...$/, // Integrity constraint violation
  /^42...$/, // Syntax error or access rule violation
];

/**
 * Shared logic for uploading PowerSync CRUD transactions to Supabase.
 * This can be used by both the React Native Connector and Node.js test utilities.
 *
 * Uses a pre-sorted batch strategy to optimize performance:
 * - Groups PUT operations by table for bulk upsert
 * - Groups DELETE operations by table for bulk delete
 * - Executes PATCH operations individually (cannot be easily batched)
 */
export async function uploadToSupabase(
  supabaseClient: SupabaseClient,
  transaction: CrudTransaction,
): Promise<void> {
  try {
    // Group operations by type and table
    const putOps: { [table: string]: any[] } = {};
    const deleteOps: { [table: string]: string[] } = {};
    const patchOps: CrudEntry[] = [];

    // Organize operations
    for (const op of transaction.crud) {
      switch (op.op) {
        case UpdateType.PUT:
          if (!putOps[op.table]) {
            putOps[op.table] = [];
          }
          putOps[op.table].push({ ...op.opData, id: op.id });
          break;
        case UpdateType.PATCH:
          patchOps.push(op);
          break;
        case UpdateType.DELETE:
          if (!deleteOps[op.table]) {
            deleteOps[op.table] = [];
          }
          deleteOps[op.table].push(op.id);
          break;
      }
    }

    // Execute bulk PUT operations
    for (const table of Object.keys(putOps)) {
      const { error } = await supabaseClient.from(table).upsert(putOps[table]);
      if (error) {
        console.error(error);
        throw new Error(
          `Could not bulk PUT data to Supabase table ${table}: ${JSON.stringify(error)}`,
        );
      }
    }

    // Execute bulk DELETE operations
    for (const table of Object.keys(deleteOps)) {
      const { error } = await supabaseClient
        .from(table)
        .delete()
        .in("id", deleteOps[table]);
      if (error) {
        console.error(error);
        throw new Error(
          `Could not bulk DELETE data from Supabase table ${table}: ${JSON.stringify(error)}`,
        );
      }
    }

    // Execute PATCH operations individually since they can't be easily batched
    for (const op of patchOps) {
      const { error } = await supabaseClient
        .from(op.table)
        .update(op.opData)
        .eq("id", op.id);
      if (error) {
        console.error(error);
        throw new Error(
          `Could not PATCH data in Supabase: ${JSON.stringify(error)}`,
        );
      }
    }

    // Completes the transaction and moves onto the next one
    await transaction.complete();
  } catch (ex: any) {
    console.debug(ex);
    if (
      typeof ex.code == "string" &&
      FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))
    ) {
      /**
       * Instead of blocking the queue with these errors,
       * discard the (rest of the) transaction. These errors
       * indicate a fatal issue
       */
      console.error("Data upload error - discarding transaction:", ex);
      await transaction.complete();
    } else {
      // Error may be retryable - e.g. network error or temporary server error.
      // Throwing an error here causes this call to be retried after a delay.
      throw ex;
    }
  }
}
