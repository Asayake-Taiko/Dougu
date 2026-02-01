import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { AuthStyles } from "../../styles/AuthStyles";
import PasswordInput from "../../components/PasswordInput";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { Logger } from "../../lib/utils/Logger";
import { LoginScreenNavigationProp } from "../../types/navigation";
import { authService } from "../../lib/services/auth";

export default function LoginScreen({
  navigation,
}: {
  navigation: LoginScreenNavigationProp;
}) {
  const [email, onChangeEmail] = useState("");
  const [password, onChangePassword] = useState("");
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  async function handleLogin() {
    try {
      showSpinner();
      await authService.login(email, password);
    } catch (err: any) {
      Logger.error(err);
      setMessage(err.message || "An unexpected error occurred");
    } finally {
      hideSpinner();
    }
  }

  return (
    <View style={AuthStyles.container}>
      <Text style={AuthStyles.header}>Login</Text>
      <TextInput
        style={AuthStyles.input}
        onChangeText={onChangeEmail}
        value={email}
        placeholder="email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PasswordInput
        password={password}
        setPassword={onChangePassword}
        placeHolder="password"
      />
      <PressableOpacity
        style={AuthStyles.button}
        onPress={handleLogin}
        testID="login-button"
      >
        <Text style={AuthStyles.btnText}>Login</Text>
      </PressableOpacity>
      <PressableOpacity onPress={() => navigation.navigate("CreateAccount")}>
        <Text style={AuthStyles.link}>Create Account</Text>
      </PressableOpacity>
      <PressableOpacity onPress={() => navigation.navigate("SendCode")}>
        <Text style={AuthStyles.link}>Forgot Password?</Text>
      </PressableOpacity>
    </View>
  );
}
