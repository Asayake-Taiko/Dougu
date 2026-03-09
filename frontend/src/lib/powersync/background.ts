import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { system } from "./System";
import { Logger } from "../utils/Logger";

export const POWERSYNC_BACKGROUND_TASK = "powersync-background-sync";

// Define the background task
TaskManager.defineTask(POWERSYNC_BACKGROUND_TASK, async () => {
  const now = new Date();
  Logger.info(`Background task executed at ${now.toISOString()}`);

  try {
    // 1. Ensure database is connected
    await system.init();

    // 2. Wait for synchronization
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // iOS has ~30s limit

    try {
      await system.powersync.waitForFirstSync({ signal: controller.signal });
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

// Register the task globally
BackgroundTask.registerTaskAsync(POWERSYNC_BACKGROUND_TASK, {
  minimumInterval: 30,
}).catch((error) => {
  Logger.error("Failed to register PowerSync background task globally:", error);
});
