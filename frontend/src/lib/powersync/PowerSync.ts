import { PowerSyncDatabase } from "@powersync/react-native";
import { ReactNativeQuickSqliteOpenFactory } from "@powersync/react-native/src/db/adapters/react-native-quick-sqlite/ReactNativeQuickSQLiteOpenFactory";
import { AppSchema } from "./schema";
import { Connector } from "./Connector";

/**
 * Initialize the PowerSync database.
 */
export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: new ReactNativeQuickSqliteOpenFactory({
    dbFilename: "dougu.db",
  }),
});

/**
 * Connect to the PowerSync database.
 */
export async function connectToDatabase() {
  const connector = new Connector();
  await db.connect(connector);
}

/**
 * Completely clear the local PowerSync database.
 * This will disconnect the database and delete the local SQLite file.
 */
export async function clearAllData() {
  await db.disconnectAndClear();
}
