import React, { useState } from "react";
import { Text, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { confirmResetPassword } from "aws-amplify/auth";

import { ResetPasswordScreenProps } from "../types/ScreenTypes";
import { validateRequirements } from "../helper/CreateAccUtils";
import { loginCreateStyles } from "../styles/LoginCreate";
import PasswordInput from "../components/PasswordInput";

export default function ResetPasswordScreen({
  route,
  navigation,
}: ResetPasswordScreenProps) {
  const { email } = route.params;
  const [code, setCode] = useState("");
  const [password, onChangePassword] = useState("");
  const [confirmPassword, onChangeConfirmPassword] = useState("");

  const forgotPasswordSubmit = async (
    email: string,
    code: string,
    newPassword: string,
  ) => {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword,
      });
      Alert.alert("Success", "Password has been reset");
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    const validation = await validateRequirements(
      "ValidUsername",
      email,
      password,
    );
    if (!validation) {
      return;
    }
    await forgotPasswordSubmit(email, code, password);
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={loginCreateStyles.container}>
      <Text style={loginCreateStyles.title}>Change Password</Text>
      <Text style={loginCreateStyles.subtitle}>
        Enter Your Confirmation Code
      </Text>
      <TextInput
        style={loginCreateStyles.input}
        onChangeText={setCode}
        value={code}
        placeholder="code"
        keyboardType="numeric"
        testID="emailInput"
      />
      <PasswordInput
        password={password}
        setPassword={onChangePassword}
        placeHolder="new password"
      />
      <PasswordInput
        password={confirmPassword}
        setPassword={onChangeConfirmPassword}
        placeHolder="confirm password"
      />
      <Pressable style={loginCreateStyles.button} onPress={handleSubmit}>
        <Text style={loginCreateStyles.btnText}>Reset Password</Text>
      </Pressable>
    </SafeAreaView>
  );
}
