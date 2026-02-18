import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { AuthStyles } from "../../styles/AuthStyles";
import PasswordInput from "../../components/PasswordInput";
import { useRoute } from "@react-navigation/native";
import type { ResetPasswordScreenRouteProp } from "../../types/navigation";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/utils/Logger";
import { PressableOpacity } from "../../components/PressableOpacity";
import { authService } from "../../lib/services/auth";
import { Colors } from "../../styles/global";

export default function ResetPasswordScreen() {
  const [password, onChangePassword] = useState("");
  const [confirmPassword, onChangeConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const email = route.params?.email || "";
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();

  async function handleResetPassword() {
    try {
      showSpinner();
      await authService.confirmResetPassword(
        email,
        code,
        password,
        confirmPassword,
      );
      setMessage("Password has been reset successfully");
    } catch (err: any) {
      Logger.error(err);
      setMessage(err.message || "An unexpected error occurred");
    } finally {
      hideSpinner();
    }
  }

  return (
    <View style={AuthStyles.container}>
      <Text style={AuthStyles.header}>Change Password</Text>
      <Text style={AuthStyles.subtitle}>Enter the code sent to your email</Text>
      <TextInput
        style={AuthStyles.input}
        onChangeText={setCode}
        value={code}
        placeholder="code"
        placeholderTextColor={Colors.gray500}
        keyboardType="numeric"
        testID="codeInput"
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
      <PressableOpacity style={AuthStyles.button} onPress={handleResetPassword}>
        <Text style={AuthStyles.btnText}>Verify Code</Text>
      </PressableOpacity>
    </View>
  );
}
