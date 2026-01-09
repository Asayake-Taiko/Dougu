import React, { ReactNode, useEffect } from "react";
import { PowerSyncContext } from "@powersync/react-native";
import { db, setupDatabase, connectToDatabase } from "../powersync/PowerSync";

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
    setupDatabase();
    connectToDatabase();
  }, []);

  return (
    <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>
  );
};
