import React, { useEffect } from "react";
import { Platform } from "react-native";
import {
  requestPermissionsAsync,
  setNotificationChannelAsync,
  AndroidImportance,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  SchedulableTriggerInputTypes,
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

  // make sure we have permission to send notifications
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

  // schedule a weekly reminder to check in and sync equipment
  useEffect(() => {
    const REENGAGEMENT_REMINDER_ID = "reengagement-reminder";

    async function refreshReminder() {
      if (session) {
        await scheduleNotificationAsync({
          identifier: REENGAGEMENT_REMINDER_ID,
          content: {
            title: "Stay up to date!",
            body: "It's been a week since you last checked your equipment! Please open the app to make sure everything is correct",
            data: { type: "reengagement" },
          },
          trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 7 * 24 * 60 * 60, // 7 days in seconds
          },
        });
      } else {
        await cancelScheduledNotificationAsync(REENGAGEMENT_REMINDER_ID);
      }
    }

    refreshReminder();
  }, [session]);

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
