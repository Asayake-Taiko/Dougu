import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";

import { loginCreateStyles } from "../styles/LoginCreate";
import { VerifyEmailScreenProps } from "../types/ScreenTypes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  autoSignIn,
  confirmSignUp,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { useUser } from "../helper/context/UserContext";
import { useLoad } from "../helper/context/LoadingContext";
import { handleError } from "../helper/Utils";

/*
  VerifyEmail screen is for when users sign up and
  need to verify their email. This screen allows them
  to enter the code sent to their email.
*/
export default function VerifyEmailScreen({
  navigation,
  route,
}: VerifyEmailScreenProps) {
  const [code, setCode] = useState("");
  const { email } = route.params;
  const { setUser } = useUser();
  const { setIsLoading } = useLoad();

  // verify the email and sign in
  const handleVerify = async () => {
    try {
      setIsLoading(true);
      // verify the email (server)
      await confirmSignUp({ username: email, confirmationCode: code });
      await autoSignIn();
      // update user context (local)
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
      setUser(userObj);
      // navigate to next screen
      navigation.navigate("SyncScreen", { syncType: "START" });
      setIsLoading(false);
    } catch (error) {
      handleError("verifyEmail", error as Error, setIsLoading);
    }
  };

  return (
    <SafeAreaView>
      <View style={loginCreateStyles.requestContainer}>
        <Text style={loginCreateStyles.title}>Verify Email</Text>
        <Text style={loginCreateStyles.subtitle}>
          We just sent you an email with a code. Enter it here.
        </Text>
        <TextInput
          style={loginCreateStyles.input}
          onChangeText={setCode}
          value={code}
          placeholder="code"
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={loginCreateStyles.button}
          onPress={handleVerify}
        >
          <Text style={loginCreateStyles.btnText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
