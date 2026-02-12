import { useState } from "react";
import { View, Text, TextInput, Image } from "react-native";
import { AuthStyles } from "../../styles/AuthStyles";
import { PressableOpacity } from "../../components/PressableOpacity";
import { LandingScreenNavigationProp } from "../../types/navigation";
import { useModal } from "../../lib/context/ModalContext";
import GoogleIcon from "../../assets/google.png";

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
        placeholder="email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PressableOpacity style={AuthStyles.button} onPress={handleEmail}>
        <Text style={AuthStyles.btnText}>Sign up with email</Text>
      </PressableOpacity>

      <View style={AuthStyles.separatorContainer}>
        <View style={AuthStyles.separatorLine} />
        <Text style={AuthStyles.separatorText}>or continue with</Text>
        <View style={AuthStyles.separatorLine} />
      </View>

      <PressableOpacity style={AuthStyles.googleButton} onPress={undefined}>
        <Image source={GoogleIcon} style={{ width: 24, height: 24 }} />
        <Text style={AuthStyles.googleButtonText}>Google</Text>
      </PressableOpacity>

      <View style={AuthStyles.signInContainer}>
        <Text style={AuthStyles.footerText}>Already have an account?</Text>
        <PressableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={AuthStyles.link}> Sign In</Text>
        </PressableOpacity>
      </View>
    </View>
  );
}
