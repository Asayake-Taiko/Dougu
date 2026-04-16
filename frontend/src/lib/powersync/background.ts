import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { system } from "./System";
import { Logger } from "../utils/Logger";

export const POWERSYNC_BACKGROUND_TASK = "powersync-background-sync";

// Allow notifications to show even when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sync Success",
        body: "Background sync completed successfully.",
      },
      trigger: null,
    });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    Logger.error("Background sync failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sync Failed",
        body: `Background sync failed: ${errorMessage}`,
      },
      trigger: null,
    });
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// Register the task globally
BackgroundTask.registerTaskAsync(POWERSYNC_BACKGROUND_TASK, {
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
