import { PowerSyncDatabase } from "@powersync/react-native";
import { ReactNativeQuickSqliteOpenFactory } from "@powersync/react-native/src/db/adapters/react-native-quick-sqlite/ReactNativeQuickSQLiteOpenFactory";
import { AppSchema } from "./schema";
import { Connector } from "./Connector";
import { Logger } from "../utils/Logger";

export class System {
  powersync: PowerSyncDatabase;
  connector: Connector;

  constructor() {
    this.connector = new Connector();
    this.powersync = new PowerSyncDatabase({
      schema: AppSchema,
      database: new ReactNativeQuickSqliteOpenFactory({
        dbFilename: "dougu.db",
      }),
    });
  }

  async init() {
    if (!this.powersync.connected) {
      Logger.info("System: Connecting to PowerSync database...");
      await this.powersync.connect(this.connector);
      Logger.info("System: PowerSync database connected.");
    }
  }

  async disconnect() {
    await this.powersync.disconnect();
    Logger.info("System: PowerSync database disconnected.");
  }

  async clearAllData() {
    await this.powersync.disconnectAndClear();
    Logger.info("System: PowerSync database cleared.");
  }
}

export const system = new System();
