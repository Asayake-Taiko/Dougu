import { View, TextInput, Text } from "react-native";
import { TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { signUp } from "aws-amplify/auth";

// Project Files
import { useLoad } from "../helper/context/LoadingContext";
import { handleError, setUserContext } from "../helper/Utils";
import { NavigationOnlyProps } from "../types/ScreenTypes";
import { validateRequirements } from "../helper/CreateAccUtils";
import { loginCreateStyles } from "../styles/LoginCreate";
import { profileMapping } from "../helper/ImageMapping";
import PasswordInput from "./PasswordInput";
import { useUser } from "../helper/context/UserContext";

/*
  A component that allows the user to create an account
  using their email and password. This is handled by
  using Cognito from AWS Amplify. Users are also uploaded
  to the database using Amplify Datastore.
*/
export default function CreateAccScreen({ navigation }: NavigationOnlyProps) {
  const { setIsLoading } = useLoad();
  const { setUser } = useUser();

  // for the form
  const [email, onChangeEmail] = React.useState("");
  const [first, onChangeFirst] = React.useState("");
  const [last, onChangeLast] = React.useState("");
  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");

  // username = first + ' ' + last
  useEffect(() => {
    onChangeUsername(first + " " + last);
  }, [first, last]);

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      const validation = await validateRequirements(username, email, password);
      if (!validation) {
        setIsLoading(false);
        return;
      }
      // get a random profile key to set as user profile
      var keys = Object.keys(profileMapping);
      const userProfile = keys[(keys.length * Math.random()) << 0];
      await signUp({
        username: email, // email is the username
        password: password,
        options: {
          userAttributes: {
            name: username,
            profile: userProfile,
          },
          autoSignIn: true,
        },
      });
      onChangeEmail("");
      onChangeFirst("");
      onChangeLast("");
      onChangePassword("");
      onChangeUsername("");
      setUserContext(setUser);
      setIsLoading(false);
      navigation.navigate("VerifyEmail", { email: email });
    } catch (error) {
      handleError("handleSignUp", error as Error, setIsLoading);
    }
  };

  return (
    <View style={loginCreateStyles.container}>
      <Text style={loginCreateStyles.header}>Create Account</Text>
      <View style={loginCreateStyles.nameContainer}>
        <TextInput
          style={loginCreateStyles.name}
          onChangeText={onChangeFirst}
          value={first}
          placeholder="first"
          keyboardType="default"
        />
        <TextInput
          style={loginCreateStyles.name}
          onChangeText={onChangeLast}
          value={last}
          placeholder="last"
          keyboardType="default"
        />
      </View>
      <TextInput
        style={loginCreateStyles.input}
        onChangeText={onChangeEmail}
        value={email}
        placeholder="email"
        keyboardType="email-address"
      />
      <PasswordInput
        password={password}
        setPassword={onChangePassword}
        placeHolder="password"
      />
      <TouchableOpacity style={loginCreateStyles.button} onPress={handleSignUp}>
        <Text style={loginCreateStyles.btnText}>Create</Text>
      </TouchableOpacity>
      <Text
        style={loginCreateStyles.forgotPassword}
        onPress={() => {
          navigation.navigate("ResendCode", { type: "verify" });
        }}
      >
        Resend Code
      </Text>
    </View>
  );
}
