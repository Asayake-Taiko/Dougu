import { registerTaskAsync, BackgroundTaskResult } from "expo-background-task";
import { defineTask } from "expo-task-manager";
import {
  setNotificationHandler,
  scheduleNotificationAsync,
} from "expo-notifications";
import { system } from "./System";
import { Logger } from "../utils/Logger";

export const POWERSYNC_BACKGROUND_TASK = "powersync-background-sync";

// Allow notifications to show even when the app is foregrounded
setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Define the background task
defineTask(POWERSYNC_BACKGROUND_TASK, async () => {
  const now = new Date();
  Logger.info(`Background tbask executed at ${now.toISOString()}`);

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
    return BackgroundTaskResult.Success;
  } catch (error) {
    Logger.error("Background sync failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    await scheduleNotificationAsync({
      content: {
        title: "Sync Failed",
        body: `Background sync failed: ${errorMessage}`,
      },
      trigger: null,
    });
    return BackgroundTaskResult.Failed;
  }
});

// Register the task globally
registerTaskAsync(POWERSYNC_BACKGROUND_TASK, {
  minimumInterval: 30,
})
  .then(() => {
    Logger.info("Background task registered successfully");
  })
  .catch((error) => {
    Logger.error(
      "Failed to register PowerSync background task globally:",
      error,
    );
  });
