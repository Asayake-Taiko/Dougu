import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./lib/context/AuthContext";
import { SpinnerProvider } from "./lib/context/SpinnerContext";
import { ModalProvider } from "./lib/context/ModalContext";
import { PowerSyncProvider } from "./lib/context/PowerSyncContext";
import SplashScreen from "./screens/splash";
import AuthNavigator from "./screens/authentication/AuthNavigator";
import RootStackNavigator from "./screens/organization/RootStackNavigator";

function AppContent() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {session ? <RootStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PowerSyncProvider>
        <AuthProvider>
          <SpinnerProvider>
            <ModalProvider>
              <AppContent />
            </ModalProvider>
          </SpinnerProvider>
        </AuthProvider>
      </PowerSyncProvider>
    </SafeAreaProvider>
  );
}
