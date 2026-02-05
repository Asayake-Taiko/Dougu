import { PowerSyncDatabase } from "@powersync/react-native";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite";
import { AppSchema } from "./schema";
import { Connector } from "./Connector";

/**
 * Initialize the PowerSync database.
 */
export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: new OPSqliteOpenFactory({
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
