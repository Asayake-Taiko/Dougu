import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import LoadingProvider from "../../helper/context/LoadingContext";
import UserProvider from "../../helper/context/UserContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
/* eslint-disable no-undef */

const MockLoadingProvider = ({ children, isLoading }) => {
  const setIsLoading = jest.fn();
  return (
    <LoadingProvider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingProvider>
  );
};

const mockUser = {
  attributes: {
    sub: "sub",
    name: "name",
  },
};

const mockOrg = {
  id: "id",
  name: "mockName",
  accessCode: "accessCode",
  image: "image",
  manager: "manager",
};

const mockOrgUserStorage = {
  id: "id",
  name: "name",
  organization: mockOrg,
  type: "type",
};

const MockUserProvider = ({
  children,
  user = mockUser,
  org = mockOrg,
  orgUserStorage = mockOrgUserStorage,
  contextLoading = false,
}) => {
  const setUser = jest.fn();
  const setOrg = jest.fn();
  const resetContext = jest.fn();
  return (
    <UserProvider
      value={{
        user,
        setUser,
        org,
        setOrg,
        orgUserStorage,
        contextLoading,
        resetContext,
      }}
    >
      {children}
    </UserProvider>
  );
};

const Stack = createNativeStackNavigator();

const MockedNavigator = ({ children }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MockScreen">{() => children}</Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export { MockLoadingProvider, MockUserProvider, MockedNavigator };
