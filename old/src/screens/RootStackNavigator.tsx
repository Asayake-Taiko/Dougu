import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./HomeScreen";
import DrawerNav from "./drawer/DrawerNav";
import SyncScreen from "./SyncScreen";
import AccessCodeScreen from "./AccessCodeScreen";
import SpinningIndicator from "../components/SpinningIndicator";
import { RootStackParamList } from "../types/NavigatorTypes";
import { useLoad } from "../helper/context/LoadingContext";
import HeaderProvider from "../helper/context/HeaderContext";
import VerifyEmailScreen from "./VerifyEmailScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import ResendCodeScreen from "./ResendCodeScreen";

// Create a stack navigator to handle navigation throughout the app
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  // loading indicator covers the entire app, therefore isLoading is used to determine if it should be displayed
  const { isLoading } = useLoad();

  return (
    <HeaderProvider>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerTitleAlign: "center" }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DrawerNav"
          component={DrawerNav}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SyncScreen"
          component={SyncScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ResendCode" component={ResendCodeScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="AccessCode" component={AccessCodeScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      </Stack.Navigator>
      {isLoading ? <SpinningIndicator /> : null}
    </HeaderProvider>
  );
}
