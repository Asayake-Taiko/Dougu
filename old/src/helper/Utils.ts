//import * as Sentry from "@sentry/react-native";
import { Alert } from "react-native";
import { Dispatch, SetStateAction } from "react";
import { DataStore } from "@aws-amplify/datastore";
import { fetchUserAttributes, signOut } from "aws-amplify/auth";
import { UserType } from "../types/ContextTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* this function handles errors in the app by stopping the loading indicator, logging the error, and alerting the user */
export const handleError = (
  methodName: string,
  error: Error,
  setIsLoading: Dispatch<SetStateAction<boolean>> | null,
) => {
  if (!methodName || !error) {
    console.log("Error in handleError: Missing parameters");
    return;
  }
  if (setIsLoading) setIsLoading(false);
  console.log(`Error in ${methodName}: ${error}`);
  //Sentry.setTag("methodName", methodName);
  //Sentry.captureException(error);
  Alert.alert(`Error in ${methodName}`, error.message, [{ text: "OK" }]);
  return error;
};

// function to sign out the user and clear everything
export const callSignOut = async (
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  // use any type because multiple navigation types are used
  navigation: any,
  resetContext: () => void,
) => {
  try {
    setIsLoading(true);
    await signOut();
    navigation.navigate("Home");
    resetContext();
    await DataStore.clear();
    setIsLoading(false);
  } catch (error) {
    setIsLoading(false);
    handleError("handleSignOut", error as Error, setIsLoading);
  }
};

export const setUserContext = async (
  setUser: Dispatch<SetStateAction<UserType | null>>,
) => {
  const attributes = await fetchUserAttributes();
  if (
    !attributes.name ||
    !attributes.email ||
    !attributes.sub ||
    !attributes.profile
  )
    throw new Error("Missing attributes");
  const userObj = {
    name: attributes.name,
    email: attributes.email,
    id: attributes.sub,
    profile: attributes.profile,
  };
  // save an async storage of the user
  await AsyncStorage.setItem("user", JSON.stringify(userObj));
  setUser(userObj);
};
