import React, { ReactNode, useEffect } from "react";
import { AppState } from "react-native";
import * as BackgroundTask from "expo-background-task";
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
    connectToDatabase();

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
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
            const status = await BackgroundTask.getStatusAsync();
            if (status) {
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
      subscription.remove();
    };
  }, []);

  return (
    <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>
  );
};
