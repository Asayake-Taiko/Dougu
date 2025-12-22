import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './lib/context/AuthContext';
import SplashScreen from './screens/splash';
import AuthNavigator from './screens/authentication/AuthNavigator';
import ProfileNavigator from './screens/drawer/ProfileNavigator';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? <ProfileNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
