import React, { ReactNode, useEffect } from "react";
import { AppState } from "react-native";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { PowerSyncContext } from "@powersync/react-native";
import { db, connectToDatabase } from "../powersync/PowerSync";
import { POWERSYNC_BACKGROUND_TASK } from "../powersync/background";
import { Logger } from "../utils/Logger";

interface PowerSyncProviderProps {
  children: ReactNode;
}

/**
 * Provider for the PowerSync database instance.
 */
export const PowerSyncProvider: React.FC<PowerSyncProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    // Connect immediately on mount
    connectToDatabase();

    const appStateSubscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        Logger.info(`AppState changed to: ${nextAppState}`);
        if (nextAppState === "background") {
          Logger.info("Registering PowerSync background task");
          try {
            await BackgroundTask.registerTaskAsync(POWERSYNC_BACKGROUND_TASK, {
              minimumInterval: 15, // 15 minutes
            });
          } catch (error) {
            Logger.error(
              "Failed to register PowerSync background task:",
              error,
            );
          }
        } else if (nextAppState === "active") {
          try {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(
              POWERSYNC_BACKGROUND_TASK,
            );
            if (isRegistered) {
              Logger.info("Unregistering PowerSync background task");
              await BackgroundTask.unregisterTaskAsync(
                POWERSYNC_BACKGROUND_TASK,
              );
            }
          } catch (error) {
            Logger.error(
              "Failed to check/unregister background task status:",
              error,
            );
          }
        }
      },
    );

    return () => {
      // Disconnect when the provider unmounts (e.g. on logout)
      db.disconnect();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>
  );
};
