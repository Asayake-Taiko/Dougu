import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LandingScreen from "./Landing";
import LoginScreen from "./Login";
import CreateAccountScreen from "./CreateAccount";
import SendCodeScreen from "./SendCode";
import ResetPasswordScreen from "./ResetPassword";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        cardStyle: { backgroundColor: "#fff" },
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SendCode" component={SendCodeScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
