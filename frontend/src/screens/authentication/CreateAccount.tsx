import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { AuthStyles } from "../../styles/AuthStyles";
import { useAuth } from "../../lib/context/AuthContext";
import PasswordInput from "../../components/PasswordInput";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { Logger } from "../../lib/utils/Logger";
import { CreateAccountScreenNavigationProp } from "../../types/navigation";

export default function CreateAccountScreen({
  navigation,
}: {
  navigation: CreateAccountScreenNavigationProp;
}) {
  const [email, onChangeEmail] = useState("");
  const [first, onChangeFirst] = useState("");
  const [last, onChangeLast] = useState("");
  const [password, onChangePassword] = useState("");
  const { register } = useAuth();
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  async function handleRegister() {
    try {
      showSpinner();
      await register(email, first + " " + last, password);
    } catch (err: any) {
      Logger.error(err);
      setMessage(err.message || "An unexpected error occured");
    } finally {
      hideSpinner();
    }
  }

  return (
    <View style={AuthStyles.container}>
      <Text style={AuthStyles.header}>Create Account</Text>
      <View style={AuthStyles.nameContainer}>
        <TextInput
          style={AuthStyles.name}
          onChangeText={onChangeFirst}
          value={first}
          placeholder="first"
          keyboardType="default"
        />
        <TextInput
          style={AuthStyles.name}
          onChangeText={onChangeLast}
          value={last}
          placeholder="last"
          keyboardType="default"
        />
      </View>
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
      <PressableOpacity style={AuthStyles.button} onPress={handleRegister}>
        <Text style={AuthStyles.btnText}>Create</Text>
      </PressableOpacity>
    </View>
  );
}
