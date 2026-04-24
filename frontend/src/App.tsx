import React, { useEffect } from "react";
import { Platform } from "react-native";
import {
  requestPermissionsAsync,
  setNotificationChannelAsync,
  AndroidImportance,
} from "expo-notifications";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./lib/context/AuthContext";
import { SpinnerProvider } from "./lib/context/SpinnerContext";
import { ModalProvider } from "./lib/context/ModalContext";
import { PowerSyncProvider } from "./lib/context/PowerSyncContext";
import { ProfileProvider } from "./lib/context/ProfileContext";
import SplashScreen from "./screens/splash";
import AuthNavigator from "./screens/authentication/AuthNavigator";
import RootStackNavigator from "./screens/organization/RootStackNavigator";

function AppContent() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    async function requestPermissions() {
      await requestPermissionsAsync();

      if (Platform.OS === "android") {
        await setNotificationChannelAsync("default", {
          name: "default",
          importance: AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }
    requestPermissions();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {session ? (
        <PowerSyncProvider>
          <ProfileProvider>
            <RootStackNavigator />
          </ProfileProvider>
        </PowerSyncProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <SpinnerProvider>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </SpinnerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
