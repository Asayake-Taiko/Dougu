import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { db, connectToDatabase } from "./PowerSync";
import { Logger } from "../utils/Logger";

export const POWERSYNC_BACKGROUND_TASK = "powersync-background-sync";

// Define the background task
TaskManager.defineTask(POWERSYNC_BACKGROUND_TASK, async () => {
  const now = new Date();
  Logger.info(`Background task executed at ${now.toISOString()}`);

  try {
    // 1. Ensure database is connected
    if (!db.connected) {
      Logger.info("Database not connected in background, connecting...");
      await connectToDatabase();
    }

    // 2. Wait for synchronization
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // iOS has ~30s limit

    try {
      await db.waitForFirstSync({ signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    Logger.info("Background sync completed successfully");
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    Logger.error("Background sync failed:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
