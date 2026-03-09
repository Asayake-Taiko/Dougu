import React, { ReactNode, useEffect } from "react";
import { AppState } from "react-native";
import { PowerSyncContext } from "@powersync/react-native";
import { system } from "../powersync/System";
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
    system.init();

    const appStateSubscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        Logger.info(`AppState changed to: ${nextAppState}`);
        if (nextAppState === "active") {
          try {
            // Ensure we are connected when returning to foreground
            if (!system.powersync.connected) {
              Logger.info("PowerSync not connected on resume, connecting...");
              system.init();
            }
          } catch (error) {
            Logger.error("Failed to reconnect on resume:", error);
          }
        }
      },
    );

    return () => {
      // Disconnect when the provider unmounts (e.g. on logout)
      system.disconnect();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <PowerSyncContext.Provider value={system.powersync}>
      {children}
    </PowerSyncContext.Provider>
  );
};
