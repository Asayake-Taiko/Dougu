import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";

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
        keyboardType="default"
        {...props}
      />
      <MaterialCommunityIcons
        name={showPassword ? "eye" : "eye-off"}
        size={28}
        color="#aaa"
        style={styles.icon}
        onPress={() => setShowPassword(!showPassword)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    padding: 5,
    width: "18%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    width: "80%",
    height: 50,
    marginTop: "5%",
  },
  pinput: {
    height: 50,
    margin: "5%",
    padding: 10,
    width: "75%",
  },
});
