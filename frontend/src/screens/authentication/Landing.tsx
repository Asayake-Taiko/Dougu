import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { AuthStyles } from "../../styles/AuthStyles";
import { PressableOpacity } from "../../components/PressableOpacity";
import { LandingScreenNavigationProp } from "../../types/navigation";
import { useModal } from "../../lib/context/ModalContext";

export default function LandingScreen({
  navigation,
}: {
  navigation: LandingScreenNavigationProp;
}) {
  const [email, onChangeEmail] = useState("");
  const { setMessage } = useModal();

  async function handleEmail() {
    if (!email.trim()) {
      setMessage("Please enter your email");
      return;
    }
    navigation.navigate("CreateAccount", { email });
  }

  return (
    <View style={AuthStyles.container}>
      <Text style={AuthStyles.logo}>dougu</Text>
      <Text style={AuthStyles.header}>Create an account</Text>
      <Text style={AuthStyles.subtitle}>Enter your email to sign up</Text>
      <TextInput
        style={AuthStyles.input}
        onChangeText={onChangeEmail}
        value={email}
        placeholder="email@domain.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PressableOpacity style={AuthStyles.button} onPress={handleEmail}>
        <Text style={AuthStyles.btnText}>Sign up with email</Text>
      </PressableOpacity>
      <Text style={AuthStyles.additionalText}>
        ---------- or continue with ----------
      </Text>
      <PressableOpacity style={AuthStyles.button} onPress={undefined}>
        <Text style={AuthStyles.btnText}>Google</Text>
      </PressableOpacity>
      <View style={AuthStyles.signInContainer}>
        <Text style={AuthStyles.additionalText}>Already have an account?</Text>
        <PressableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={AuthStyles.link}>Sign In</Text>
        </PressableOpacity>
      </View>
    </View>
  );
}
