import {
  PowerSyncBackendConnector,
  AbstractPowerSyncDatabase,
  UpdateType,
} from "@powersync/react-native";
import { supabase } from "../supabase/supabase";
import { Logger } from "../utils/Logger";

/**
 * Connector for PowerSync to upload data to Supabase.
 */
export class Connector implements PowerSyncBackendConnector {
  /**
   * Implement fetchCredentials to obtain a JWT from your authentication service.
   */
  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      throw error;
    }

    return {
      endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL ?? "",
      token: session.access_token,
    };
  }

  /**
   * Implement uploadData to send local changes to your backend service.
   */
  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) {
      return;
    }

    try {
      for (const op of transaction.crud) {
        const table = op.table;
        const record = op.opData || {};
        const id = op.id;

        // The data that needs to be changed in the remote db
        switch (op.op) {
          case UpdateType.PUT:
            // Instruct supabase to CREATE or UPDATE a record
            await supabase.from(table).upsert({ ...record, id });
            break;
          case UpdateType.PATCH:
            // Instruct supabase to PATCH a record
            await supabase.from(table).update(record).eq("id", id);
            break;
          case UpdateType.DELETE:
            // Instruct supabase to DELETE a record
            await supabase.from(table).delete().eq("id", id);
            break;
        }
      }

      // Completes the transaction and moves onto the next one
      await transaction.complete();
    } catch (error) {
      Logger.error("Error uploading data to Supabase:", error);
      throw error;
    }
  }
}
