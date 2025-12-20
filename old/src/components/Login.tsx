import { View, TextInput, TouchableOpacity, Text } from "react-native";
import React from "react";
import { signIn, signOut } from "aws-amplify/auth";

// Project Files
import { useLoad } from "../helper/context/LoadingContext";
import { useUser } from "../helper/context/UserContext";
import { NavigationOnlyProps } from "../types/ScreenTypes";
import { handleError, setUserContext } from "../helper/Utils";
import { loginCreateStyles } from "../styles/LoginCreate";
import PasswordInput from "./PasswordInput";

interface CustomError extends Error {
  underlyingError?: string;
}

/*
  A component that allows the user to login to the app 
  using their email and password. This is handled by 
  using Cognito from AWS Amplify
*/
export default function LoginScreen({ navigation }: NavigationOnlyProps) {
  const { setIsLoading } = useLoad();
  const { setUser } = useUser();

  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signOut();
      await signIn({ username, password });
      await setUserContext(setUser);
      setIsLoading(false);
      onChangePassword("");
      onChangeUsername("");
      navigation.navigate("SyncScreen", { syncType: "START" });
    } catch (error) {
      const customError = error as CustomError;
      // we want to display the underlying error message for clarity
      if (customError.underlyingError) {
        customError.message = customError.underlyingError;
      }
      handleError("signIn", customError, setIsLoading);
    }
  };

  return (
    <View style={loginCreateStyles.container}>
      <Text style={loginCreateStyles.header}>Login</Text>
      <TextInput
        style={loginCreateStyles.input}
        onChangeText={onChangeUsername}
        value={username}
        placeholder="email"
        keyboardType="email-address"
        testID="emailInput"
      />
      <PasswordInput
        password={password}
        setPassword={onChangePassword}
        placeHolder="password"
        testID="passwordInput"
      />
      <TouchableOpacity
        style={loginCreateStyles.button}
        onPress={handleSignIn}
        testID="signInButton"
      >
        <Text style={loginCreateStyles.btnText}>Login</Text>
      </TouchableOpacity>
      <Text
        style={loginCreateStyles.forgotPassword}
        onPress={() => {
          navigation.navigate("ResendCode", { type: "reset" });
        }}
      >
        Forgot Password?
      </Text>
    </View>
  );
}
