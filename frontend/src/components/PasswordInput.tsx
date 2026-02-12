import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Colors, Spacing, Layout } from "../styles/global";
import { PressableOpacity } from "./PressableOpacity";

export default function PasswordInput({
  password,
  setPassword,
  placeHolder,
  ...props
}: {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  placeHolder: string;
  [key: string]: any;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.pinput}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        value={password}
        placeholder={placeHolder}
        placeholderTextColor={Colors.gray400}
        keyboardType="default"
        autoCapitalize="none"
        {...props}
      />
      <PressableOpacity onPress={() => setShowPassword(!showPassword)}>
        <MaterialCommunityIcons
          name={showPassword ? "eye" : "eye-off"}
          size={24}
          color={Colors.gray400}
          style={styles.icon}
        />
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    paddingRight: Spacing.sm,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: Layout.borderWidth.thin,
    borderColor: Colors.gray300,
    borderRadius: Layout.borderRadius.md,
    width: "80%",
    height: Layout.dimensions.buttonHeight,
    marginBottom: Spacing.md,
  },
  pinput: {
    flex: 1,
    height: "100%",
    paddingLeft: Spacing.sm,
  },
});
