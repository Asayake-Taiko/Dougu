import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { AuthStyles } from "../../styles/AuthStyles";
import PasswordInput from "../../components/PasswordInput";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { Logger } from "../../lib/utils/Logger";
import { useRoute } from "@react-navigation/native";
import type { CreateAccountScreenRouteProp } from "../../types/navigation";
import { authService } from "../../lib/services/auth";

export default function CreateAccountScreen() {
  const [first, onChangeFirst] = useState("");
  const [last, onChangeLast] = useState("");
  const [password, onChangePassword] = useState("");
  const route = useRoute<CreateAccountScreenRouteProp>();
  const email = route.params?.email || "";
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  async function handleRegister() {
    try {
      showSpinner();
      await authService.register(email, first + " " + last, password);
    } catch (err: any) {
      Logger.error(err);
      setMessage(err.message || "An unexpected error occured");
    } finally {
      hideSpinner();
    }
  }

  return (
    <View style={AuthStyles.container}>
      <Text style={AuthStyles.header}>Great!</Text>
      <Text style={AuthStyles.subtitle}>Can we get your name too?</Text>
      <TextInput
        style={AuthStyles.input}
        onChangeText={onChangeFirst}
        value={first}
        placeholder="first name"
        keyboardType="default"
      />
      <TextInput
        style={AuthStyles.input}
        onChangeText={onChangeLast}
        value={last}
        placeholder="last name"
        keyboardType="default"
      />
      <PasswordInput
        password={password}
        setPassword={onChangePassword}
        placeHolder="password"
      />
      <PressableOpacity style={AuthStyles.button} onPress={handleRegister}>
        <Text style={AuthStyles.btnText}>Finish signing up</Text>
      </PressableOpacity>
    </View>
  );
}
