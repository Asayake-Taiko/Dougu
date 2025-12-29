import { Overlay, Button } from "@rneui/themed";
import { Dispatch, SetStateAction, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { updatePassword } from "aws-amplify/auth";

import { handleError } from "../../helper/Utils";
import { loginCreateStyles } from "../../styles/LoginCreate";
import PasswordInput from "../PasswordInput";

/*
    A component that allows the user to change their password
    in the profile screen
*/
export default function PasswordOverlay({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // update user profile attributes in Cognito
  const handleSet = async () => {
    try {
      // ensure new password and confirm password match
      if (newPassword !== confirmPassword) {
        Alert.alert("Passwords do not match", "Please try again");
        return;
      }
      // check password length
      if (newPassword.length < 8) {
        Alert.alert(
          "Form Error",
          "Password must be at least 8 characters long.",
        );
        return;
      }
      // set user password in cognito
      await updatePassword({ oldPassword: currPassword, newPassword });
      setCurrPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVisible(false);
      Alert.alert("Password Updated", "Your password has been updated");
    } catch (e) {
      handleError("handleSet", e as Error, null);
    }
  };

  return (
    <Overlay
      isVisible={visible}
      fullScreen
      animationType="slide"
      overlayStyle={{ alignItems: "center" }}
    >
      <View style={styles.row}>
        <Button
          icon={{ name: "arrow-left", type: "font-awesome", color: "black" }}
          title="Profile"
          titleStyle={{ color: "black" }}
          type="clear"
          onPress={() => setVisible(false)}
          buttonStyle={{ alignSelf: "flex-start" }}
        />
      </View>
      <Text style={loginCreateStyles.header}>Change Password</Text>
      <PasswordInput
        password={currPassword}
        setPassword={setCurrPassword}
        placeHolder="current password"
      />
      <PasswordInput
        password={newPassword}
        setPassword={setNewPassword}
        placeHolder="new password"
      />
      <PasswordInput
        password={confirmPassword}
        setPassword={setConfirmPassword}
        placeHolder="confirm password"
      />
      <Button
        radius={"md"}
        type="solid"
        icon={{ name: "save", type: "font-awesome", color: "white" }}
        title="Save"
        buttonStyle={styles.button}
        containerStyle={{ width: "80%" }}
        onPress={handleSet}
      />
    </Overlay>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#333333",
    marginTop: "5%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
});
