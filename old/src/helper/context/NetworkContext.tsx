import React, { useState, useContext, useEffect } from "react";
import { NetworkContextType } from "../../types/ContextTypes";
import NetInfo from "@react-native-community/netinfo";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { DataStore } from "aws-amplify/datastore";

// run a background task to sync data when network is available
// this is to ensure that even when the app is closed, data is still synced
const TASK_NAME = "background-fetch";
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const info = await NetInfo.fetch();
    if (info.isConnected) {
      await DataStore.start();
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error(error);
    await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// register the background task with a minimum interval of 10 minutes
async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 5, // 5 minutes
  });
}

const NetworkContext = React.createContext<NetworkContextType | undefined>(
  undefined,
);

/* 
    Context that distributes the loading state to the app
    if loading, the app will display a loading indicator
    if !dataStoreReady, a loading page will be displayed
*/
export default function NetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnected, setIsConnected] = useState(false);

  // ensure network connection since api calls are made
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      setIsConnected(state.isConnected!);
      const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
      if (!state.isConnected && !isRegistered) {
        await registerBackgroundFetchAsync();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, setIsConnected }}>
      {children}
    </NetworkContext.Provider>
  );
}

// ensure that LoadingContext isn't undefined in useLoad
export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useLoad must be used within a LoadingProvider");
  }
  return context;
};
