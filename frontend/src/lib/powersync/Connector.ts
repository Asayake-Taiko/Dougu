import {
  PowerSyncBackendConnector,
  AbstractPowerSyncDatabase,
} from "@powersync/react-native";
import { supabase } from "../supabase/supabase";
import { uploadToSupabase } from "./SupabaseUploader";
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
      await uploadToSupabase(supabase, transaction);
    } catch (error) {
      Logger.error("Error uploading data to Supabase:", error);
      throw error;
    }
  }
}
